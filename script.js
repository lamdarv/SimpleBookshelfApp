const incompleteBookshelfList = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-todo';
const STORAGE_KEY = 'BOOKSHELF_APPS';

document.addEventListener('DOMContentLoaded', function() {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addBook();
    });
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function addBook() {
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const year = document.getElementById('inputBookYear').value;
    

    const generateID = generateId();

    if(document.getElementById('inputBookIsComplete').checked){
        const bookObject = generateBookObject(generateID, title, author, year, true);
        incompleteBookshelfList.push(bookObject);
        alert("The book has been successfully added to the 'Read' shelf!");
    }
    else{
        const bookObject = generateBookObject(generateID, title, author, year, false);
        incompleteBookshelfList.push(bookObject);
        alert("The book has been successfully added to the 'Unread' shelf!");
    }  
    
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id, 
        title,
        author,
        year,
        isCompleted
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBOOKRead = document.getElementById('incompleteBookshelfList');
    uncompletedBOOKRead.innerHTML = '';

    const completedBOOKRead = document.getElementById('completeBookshelfList');
    completedBOOKRead.innerHTML = '';

    for (const bookItem of incompleteBookshelfList) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted) {
            uncompletedBOOKRead.append(bookElement);
        } else {
            completedBOOKRead.append(bookElement);
        }
    };
});

function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = ("Penulis: " + bookObject.author);

    const textYear = document.createElement('p');
    textYear.innerText = ("Tahun: " + bookObject.year);

    const textContainer = document.createElement('article');
    textContainer.classList.add('book_item');
    textContainer.append(textTitle, textAuthor, textYear);

    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.append(textContainer);
    container.setAttribute('id', `book-${bookObject.id}`);
    
    if (bookObject.isCompleted) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');

        undoButton.addEventListener('click', function() {
            undoReadBookFromCompleted(bookObject.id);
            alert("The book has been moved to the 'Unread' shelf!");
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');

        trashButton.addEventListener('click', function() {
            removeBookFromCompleted(bookObject.id);
            alert("The book has been deleted!");
        });

        container.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');

        checkButton.addEventListener('click', function() {
            addBookToCompleted(bookObject.id);
            alert("The book has been moved to the 'Read' shelf!");
        });

        container.append(checkButton);
    }

    return container;
}

function addBookToCompleted (bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of incompleteBookshelfList) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    incompleteBookshelfList.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoReadBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for (const index in incompleteBookshelfList) {
        if (incompleteBookshelfList[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(incompleteBookshelfList);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
      alert('Browser kamu tidak mendukung local storage!');
      return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
   
    if (data !== null) {
      for (const completeBookshelfList of data) {
        incompleteBookshelfList.push(completeBookshelfList);
      }
    }
   
    document.dispatchEvent(new Event(RENDER_EVENT));
}
