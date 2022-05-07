import BookInstance from '../models/bookinstance.js';
import Book from '../models/book.js';

import { body, validationResult } from 'express-validator';

// Display list of all BookInstances.
export function bookinstance_list(req, res) {
	BookInstance.find()
		.populate('book')
		.exec(function (err, list_bookinstances) {
			if (err) {
				return next(err);
			}
			// Successful, so render
			res.render('bookinstance_list', {
				title: 'Book Instance List',
				bookinstance_list: list_bookinstances,
			});
		});
}

// Display detail page for a specific BookInstance.
export function bookinstance_detail(req, res) {
	BookInstance.findById(req.params.id)
		.populate('book')
		.exec(function (err, bookinstance) {
			if (err) {
				return next(err);
			}
			if (bookinstance == null) {
				// No results.
				var err = new Error('Book copy not found');
				err.status = 404;
				return next(err);
			}
			// Successful, so render.
			res.render('bookinstance_detail', {
				title: 'Copy: ' + bookinstance.book.title,
				bookinstance: bookinstance,
			});
		});
}

// Display BookInstance create form on GET.
export function bookinstance_create_get(req, res) {
	Book.find({}, 'title').exec((err, books) => {
		if (err) return next(err);

		res.render('bookinstance_form', {
			title: 'Create BookInstance',
			book_list: books,
		});
	});
}

// Handle BookInstance create on POST.
export const bookinstance_create_post = [
	// Validate and sanitize fields.
	body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
	body('imprint', 'Imprint must be specified')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body('status').escape(),
	body('due_back', 'Invalid date')
		.optional({ checkFalsy: true })
		.isISO8601()
		.toDate(),

	// Process request after validation and sanitization.
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		// Create a BookInstance object with escaped and trimmed data.
		var bookinstance = new BookInstance({
			book: req.body.book,
			imprint: req.body.imprint,
			status: req.body.status,
			due_back: req.body.due_back,
		});

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values and error messages.
			Book.find({}, 'title').exec(function (err, books) {
				if (err) {
					return next(err);
				}
				// Successful, so render.
				res.render('bookinstance_form', {
					title: 'Create BookInstance',
					book_list: books,
					selected_book: bookinstance.book._id,
					errors: errors.array(),
					bookinstance: bookinstance,
				});
			});
			return;
		} else {
			// Data from form is valid.
			bookinstance.save(function (err) {
				if (err) {
					return next(err);
				}
				// Successful - redirect to new record.
				res.redirect(bookinstance.url);
			});
		}
	},
];
// Display BookInstance delete form on GET.
export async function bookinstance_delete_get(req, res, next) {
	try {
		const bookInstance = await BookInstance.findById(req.params.id)
			.populate('book')
			.exec();
		res.render('bookinstance_delete', {
			title: 'Delete Book Instance',
			id: bookInstance._id,
			name: bookInstance.book.title,
			imprint: bookInstance.imprint,
			status: bookInstance.status,
			url: bookInstance.url,
		});
	} catch (error) {
		next(error);
	}
}

// Handle BookInstance delete on POST.
export async function bookinstance_delete_post(req, res, next) {
	try {
		await BookInstance.findByIdAndDelete(req.params.id);
		res.redirect('/catalog/bookinstances');
	} catch (error) {
		next(error);
	}
}

// Display BookInstance update form on GET.
export async function bookinstance_update_get(req, res, next) {
	try {
		const [books, bookInstance] = await Promise.all([
			Book.find({}, 'title').exec(),
			BookInstance.findById(req.params.id).exec(),
		]);

		res.render('bookinstance_form', {
			title: 'Update Book Instance',
			book_list: books,
			selected_book: bookInstance.book._id,
			bookinstance: bookInstance,
		});
	} catch (error) {
		next(error);
	}
}

// Handle bookinstance update on POST.
export const bookinstance_update_post = [
	// Validate and sanitize fields.
	body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
	body('imprint', 'Imprint must be specified')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body('status').escape(),
	body('due_back', 'Invalid date')
		.optional({ checkFalsy: true })
		.isISO8601()
		.toDate(),

	// Process request after validation and sanitization.
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		// Create a BookInstance object with escaped and trimmed data.
		const bookinstance = new BookInstance({
			book: req.body.book,
			imprint: req.body.imprint,
			status: req.body.status,
			due_back: req.body.due_back,
			_id: req.params.id,
		});

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values and error messages.
			Book.find({}, 'title').exec(function (err, books) {
				if (err) {
					return next(err);
				}
				// Successful, so render.
				res.render('bookinstance_form', {
					title: 'Update Book Instance',
					book_list: books,
					selected_book: bookinstance.book._id,
					errors: errors.array(),
					bookinstance: bookinstance,
				});
			});
			return;
		} else {
			// Data from form is valid.
			BookInstance.findByIdAndUpdate(
				req.params.id,
				bookinstance,
				{},
				function (err) {
					if (err) {
						return next(err);
					}
					// Successful - redirect to new record.
					res.redirect(bookinstance.url);
				}
			);
		}
	},
];
