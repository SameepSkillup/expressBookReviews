const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if user already exists
  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "Username already exists. Please choose another." });
  }

  // Add new user
  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully!" });

});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.status(200).send(JSON.stringify(books, null, 10));

});


// Using async/await
public_users.get('/books-async', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/');
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list", error: error.message });
  }
});

// Using Promises
public_users.get('/books-promise', function (req, res) {
  axios.get('http://localhost:5000/')
    .then((response) => {
      return res.status(200).json(response.data);
    })
    .catch((error) => {
      return res.status(500).json({ message: "Error fetching book list", error: error.message });
    });
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
   const isbn = req.params.isbn;

  // Check if the book with given ISBN exists
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }
 });
 public_users.get('/isbn-async/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
      const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(404).json({ message: "Book not found", error: error.message });
    }
  });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const authorParam = req.params.author.toLowerCase();
  const matchingBooks = [];

  // Loop through each book and compare authors (case-insensitive)
  for (let key in books) {
    if (books[key].author.toLowerCase() === authorParam) {
      matchingBooks.push({ isbn: key, ...books[key] });
    }
  }

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: `No books found by author '${req.params.author}'.` });
  }

});

public_users.get('/author-promise/:author', function (req, res) {
    const author = req.params.author;
    axios.get(`http://localhost:5000/author/${author}`)
      .then((response) => {
        return res.status(200).json(response.data);
      })
      .catch((error) => {
        return res.status(404).json({ message: "Author not found", error: error.message });
      });
  });

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const titleParam = req.params.title.toLowerCase();
  const matchingBooks = [];

  // Loop through books and match title (case-insensitive)
  Object.keys(books).forEach((key) => {
    if (books[key].title.toLowerCase() === titleParam) {
      matchingBooks.push({ isbn: key, ...books[key] });
    }
  });

  if (matchingBooks.length > 0) {
    res.status(200).json(matchingBooks);
  } else {
    res.status(404).json({ message: `No books found with title '${req.params.title}'.` });
  }
});
public_users.get('/title-async/:title', async function (req, res) {
    const title = req.params.title;
    try {
      const response = await axios.get(`http://localhost:5000/title/${title}`);
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(404).json({ message: "Title not found", error: error.message });
    }
  });
  

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }

});

module.exports.general = public_users;
