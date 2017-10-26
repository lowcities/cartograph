
const mainContent = document.getElementById('main-content');
const addNameBtn = document.getElementById('nameButton');
const welcomeMessage = document.getElementById('welcome');
const userContainer = document.getElementById('user-container');
const itemList = document.getElementById('item-list');
const editBtn = document.querySelector('.edit-btn');
const editCol = document.querySelector('.edit-column');
const profileSection = document.getElementById('profile-section');
const groceryList = document.querySelectorAll('.list-group');
const editItemValue = document.getElementsByClassName('item-name-edit');
const editItemForm = document.getElementsByClassName('item-edit-form');
const introContainer = document.getElementById('intro-container');

function getRegister() {
    introContainer.style.display = 'none';
    $('#main-content').load('register.html');
}


// toggle edit tools for each list item when edit button is clicked
function showEdit() {
    let groupLi = document.getElementsByClassName('edit-column');
    let itemArray = Array.prototype.slice.call(groupLi);
    for (let i = 0; i < itemArray.length; i ++) {
        $(itemArray[i]).toggleClass('active');
        
    }
}

/*  Functions for handling HTTP requests including creating Users and adding,
 editing, and deleting items from their grocery list.
======================================================================== */

// function will create a new user profile
function addUser() {
    let name = $('#name').val();
    let email = $('#email').val();
    let password = $('#password').val();
    let confirmPassword = $('#confirmPassword').val();
    const itemData = {
        name: name,
        email: email,
        password: password,
        confirmPassword: confirmPassword

    };
    console.log(itemData);

    $.ajax({
        type: "POST",
        url: '/register',
        data: JSON.stringify(itemData),
        dataType: 'json',
        contentType: 'application/json'      
    })
        .done(function(response) {
            window.currentUser = response;
            console.log("We have created a new user");
            $('#main-content').addClass('hide-content');
            renderUser();
            
        })
        .fail(function(error) {
            console.log("It didnt post.", error);
        });
}

// function will verify user login info that has been POSTed 
function getProfile () {
    let email = $('#loginEmail').val();
    let password = $('#loginPassword').val();
    let userData = {
        email: email,
        password: password
    };

    $.ajax({
        type: "POST",
        url: '/login',
        data: JSON.stringify(userData),
        dataType: 'json',
        contentType: 'application/json',    
    })
        .done(function(response) {
            console.log("We have verified the user:", response);
            window.currentUser = response;
            // navigate to profile page
            document.location.href = '/profile.html';
        })
        .fail(function(error) {
            console.log("It didnt post.", error);
        });
}

// function will GET user profile information
function getUser() {
    return $.ajax('/profile')
        .then(res => {
            console.log("Results from getUser()", res);
            return res;
        })
        .fail(err => {
            console.log('Error in getUser()', err);
            throw err;
        });
}

/* function will take user to login screen unless a current session exists,
 if a session does exist, user will be redirected to their profile */
function getLogin() {
    introContainer.style.display = 'none';
    $.ajax({
        type: "GET",
        url: '/login',
        success: function (data, textStatus, jqXHR) {
            if (typeof data.redirect == 'string') {
                window.location = '/profile.html';
            }  
        }      
      
    })
    .done(function(response) {
        $('#main-content').load('login.html');
    })
    .fail(function(error) {
    console.log("It didnt post.", error);
    });
}

// function will add(PUT) items to user's grocery list
function addItem(userId) {
    console.log(userId);
    const user = userId;
    const item = $('#itemName').val();
    const fileData = {
        _id: user,
        itemName: item
       };

    $.ajax({
        type: "PUT",
        url: `/profile/${userId}`,
        data: JSON.stringify(fileData),
        dataType: 'json',
        contentType: 'application/json'                 
    })
        .done(function(response) {
            console.log('We have posted the data');
            renderUser();
        })
        .fail(function(error) {
            console.log('Post failed', error);
        })
        console.log("File Data", fileData);
   
}

// function will find item to be edited and display a form for that specific item
function editItem (id) {
    // find the item being clicked on grocery list
    const item = window.fileList.find(users => users._id === id);
    // collect all item names
    const groceryItem = document.getElementsByClassName('item-name');
    // if we find an item that matches the given id
    if (item) {
        // get the index value of item in groceryList array
        let itemIndex = window.fileList.indexOf(item);
        console.log(itemIndex);
        console.log(editItemForm[itemIndex]);
        // access the appropriate edit form related to list item
        let currentForm = editItemForm[itemIndex];
        // get the name of the item to be edited
        let currentItem = groceryItem[itemIndex];
        // loop through all the edit forms
        for (let i = 0; i < editItemForm.length; i++) {
            // when we land on the item to be edited
            if( i === itemIndex) {
                // give the empty input field of the edit form the value of item before it's edited
                $('.item-name-edit').val(item.itemName);
                // show the edit form
                currentForm.classList.add('show-edit-form');
                // hide the list item, allowing the edit form to sit in it's place
                currentItem.style.display = 'none';
            } else {
                // hide all other edit forms
                editItemForm[i].classList.remove('show-edit-form');
                // show all other list items
                groceryItem[i].style.display = "inline-block";
            }
        }
     }
}

// function allows user to modify(PUT) items in their list
function updateItem(itemId) {
    // the item to be modified
    const item = window.fileList.find(users => users._id === itemId);
    // the index value of the item to be modified
    let itemIndex = window.fileList.indexOf(item);
    // the current user's db _id
    const userId = window.itemList._id;
    let itemName = "";
    // loop through all of the edit form input fields
    for (let i = 0; i < editItemValue.length; i++) {
        // if we reach the index value of the item to be edited
        if ( i === itemIndex ) {
            // itemName is now the changed input value
            itemName = editItemValue[i].value;
        }
    }
    const itemData = {
        userId: userId,
        itemId: itemId,
        itemName: itemName,
    };
    
    $.ajax({
        type: "PUT",
        url: `/profile/${userId}/list/${itemId}`,
        data: JSON.stringify(itemData),
        dataType: 'json',
        contentType: 'application/json'                 
    })
        .done(function(response) {
            console.log('We have posted the data');
            renderUser();
            // document.location.href = '/profile.html';
        })
        .fail(function(error) {
            console.log('Post failed', error);
        })
        console.log("File Data", itemData);
}

// function will delete specific items in user's grocery list
function deleteItem(itemId) {
    const userId = window.itemList._id;
    if (confirm("Are you sure?")) {
        $.ajax({
            type: 'DELETE',
            url: `/profile/${userId}/list/${itemId}`,
            dataType: 'json',
            contentType: 'application/json'
        })
        .done(function(response) {
            console.log("Item", itemId, " is deleted!");
            renderUser();
        })
        .fail(function(error) {
            console.log("Item did not delete");
        });
    }
}


//  function will render all current user data to the webpage
function renderUser() {
    console.log('renderUser triggered');
    const source = $(profileSection).html();
    const template = Handlebars.compile(source);
    console.log('renderUser triggered');
    getUser()
        .then(users => {

            // create an array on the window element of all grocery items for user
            window.itemList = users;
            window.fileList = users.groceryList;
            console.log(users.groceryList);

            const data = {
                userId: users._id,
                name: users.name,
                groceryList: users.groceryList
            };
            const html = template(data);
            $(userContainer).html(html);
            
            
        });
}

// if url is profile.html, render user profile
if (top.location.pathname === '/profile.html') {
    renderUser();
}
