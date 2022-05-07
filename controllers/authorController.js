import Author from '../models/author.js';
import Book from '../models/book.js';

import async from 'async';

import { body, validationResult } from 'express-validator';

// Display list of all Authors.
export function author_list(req, res) {
	Author.find()
		.sort([['family_name', 'ascending']])
		.exec(function (err, list_authors) {
			if (err) {
				return next(err);
			}
			//Successful, so render
			res.render('author_list', {
				title: 'Author List',
				author_list: list_authors,
			});
		});
}

// Display detail page for a specific Author.
export function author_detail(req, res, next) {
	async.parallel(
		{
			author: function (callback) {
				Author.findById(req.params.id).exec(callback);
			},
			authors_books: function (callback) {
				Book.find({ author: req.params.id }, 'title summary').exec(callback);
			},
		},
		function (err, results) {
			if (err) {
				return next(err);
			} // Error in API usage.
			if (results.author == null) {
				// No results.
				var err = new Error('Author not found');
				err.status = 404;
				return next(err);
			}
			// Successful, so render.
			res.render('author_detail', {
				title: 'Author Detail',
				author: results.author,
				author_books: results.authors_books,
			});
		}
	);
}

// Display Author create form on GET.
export function author_create_get(req, res) {
	res.render('author_form', { title: 'Create Author' });
}

// Handle Author create on POST.
export const author_create_post = [
	body('first_name')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('First name must be specified.')
		.isAlphanumeric()
		.withMessage('First name has non-alphanumeric characters.'),
	body('family_name')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('Family name must be specified.')
		.isAlphanumeric()
		.withMessage('Family name has non-alphanumeric characters.'),
	body('date_of_birth', 'Invalid date of birth')
		.optional({ checkFalsy: true })
		.isISO8601()
		.toDate(),
	body('date_of_death', 'Invalid date of death')
		.optional({ checkFalsy: true })
		.isISO8601()
		.toDate(),
	(req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			res.render('author_form', {
				title: 'Create Author',
				author: req.body,
				errors: errors.array(),
			});
			return;
		} else {
			const author = new Author({
				first_name: req.body.first_name,
				family_name: req.body.family_name,
				date_of_birth: req.body.date_of_birth,
				date_of_death: req.body.date_of_death,
			});
			author.save((err) => {
				if (err) {
					return next(err);
				}

				res.redirect(author.url);
			});
		}
	},
];

// Display Author delete form on GET.
export async function author_delete_get(req, res, next) {
	try {
		const [author, authorBooks] = await Promise.all([
			Author.findById(req.params.id).exec(),
			Book.find({ author: req.params.id }).exec(),
		]);
		if (author === null) {
			res.redirect('/catalog/authors');
		}

		res.render('author_delete', {
			title: 'Delete Author',
			author: author,
			author_books: authorBooks,
		});
	} catch (error) {
		next(error);
	}
}

// Handle Author delete on POST.
export function author_delete_post(req, res) {
	async.parallel(
		{
			author: function (callback) {
				Author.findById(req.body.authorid).exec(callback);
			},
			authors_books: function (callback) {
				Book.find({ author: req.body.authorid }).exec(callback);
			},
		},
		function (err, results) {
			if (err) {
				return next(err);
			}
			// Success
			if (results.authors_books.length > 0) {
				// Author has books. Render in same way as for GET route.
				res.render('author_delete', {
					title: 'Delete Author',
					author: results.author,
					author_books: results.authors_books,
				});
				return;
			} else {
				// Author has no books. Delete object and redirect to the list of authors.
				Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
					if (err) {
						return next(err);
					}
					// Success - go to author list
					res.redirect('/catalog/authors');
				});
			}
		}
	);
}

// Display Author update form on GET.
export async function author_update_get(req, res, next) {
	try {
		const [author, author_books] = await Promise.all([
			Author.findById(req.params.id).exec(),
			Book.find({ author: req.params.id }).exec(),
		]);

		res.render('author_form', {
			title: 'Update Author',
			author: author,
		});
	} catch (error) {
		next(error);
	}
}

// Handle Author update on POST.
export const author_update_post = [
	body('first_name')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('First name must be specified.')
		.isAlphanumeric()
		.withMessage('First name has non-alphanumeric characters.'),
	body('family_name')
		.trim()
		.isLength({ min: 1 })
		.escape()
		.withMessage('Family name must be specified.')
		.isAlphanumeric()
		.withMessage('Family name has non-alphanumeric characters.'),
	body('date_of_birth', 'Invalid date of birth')
		.optional({ checkFalsy: true })
		.isISO8601()
		.toDate(),
	body('date_of_death', 'Invalid date of death')
		.optional({ checkFalsy: true })
		.isISO8601()
		.toDate(),
	(req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			res.render('author_form', {
				title: 'Create Author',
				author: req.body,
				errors: errors.array(),
			});
			return;
		} else {
			const author = new Author({
				first_name: req.body.first_name,
				family_name: req.body.family_name,
				date_of_birth: req.body.date_of_birth,
				date_of_death: req.body.date_of_death,
				_id: req.params.id,
			});
			Author.findByIdAndUpdate(req.params.id, author, {}, (err) => {
				if (err) {
					return next(err);
				}

				res.redirect(author.url);
			});
		}
	},
];
