const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
return users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  // Check for missing fields
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Authenticate
  if (authenticatedUser(username, password)) {
    // Create JWT token
    const token = jwt.sign({ username }, 'access', { expiresIn: '1h' });

    // Save token in session
    req.session.accessToken = token;
    req.session.username = username;

    return res.status(200).json({ message: "Login successful!", token });
  } else {
    return res.status(401).json({ message: "Invalid username or password." });
  }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.username;

  if (!username) {
    return res.status(401).json({ message: "You must be logged in to post a review." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required." });
  }

  // Add or update review
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews
  });
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
  
    // Get JWT token from session
    const token = req.session.accessToken;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Please login" });
    }
  
    try {
      const decoded = jwt.verify(token, "fingerprint_customer");
      const username = decoded.username;
  
      // Check if book exists
      if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
      }
  
      // Check if user has a review to delete
      if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
      } else {
        return res.status(404).json({ message: "No review found for this user on the specified book" });
      }
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  });
  
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
