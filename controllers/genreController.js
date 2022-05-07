import Genre from '../models/genre.js';
import Book from '../models/book.js';
import async from 'async';
import { body, validationResult } from 'express-validator';

// Display list of all Genre.
export function genre_list(req, res) {
	Genre.find()
		.sort([['name', 'ascending']])
		.exec(function (err, list_genre) {
			if (err) {
				return next(err);
			}
			//Successful, so render
			res.render('genre_list', {
				title: 'Genre List',
				genre_list: list_genre,
			});
		});
}

// Display detail page for a specific Genre.
export function genre_detail(req, res, next) {
	async.parallel(
		{
			genre: function (callback) {
				Genre.findById(req.params.id).exec(callback);
			},

			genre_books: function (callback) {
				Book.find({ genre: req.params.id }).exec(callback);
			},
		},
		function (err, results) {
			if (err) {
				return next(err);
			}
			if (results.genre == null) {
				// No results.
				var err = new Error('Genre not found');
				err.status = 404;
				return next(err);
			}
			// Successful, so render
			res.render('genre_detail', {
				title: 'Genre Detail',
				genre: results.genre,
				genre_books: results.genre_books,
			});
		}
	);
}

// Display Genre create form on GET.
export function genre_create_get(req, res) {
	res.render('genre_form', { title: 'Create Genre' });
}

// Handle Genre create on POST.
export const genre_create_post = [
	// Validate and sanitize the name field.
	body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),

	// Process request after validation and sanitization.
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		// Create a genre object with escaped and trimmed data.
		let genre = new Genre({ name: req.body.name });

		if (!errors.isEmpty()) {
			// There are errors. Render the form again with sanitized values/error messages.
			res.render('genre_form', {
				title: 'Create Genre',
				genre: genre,
				errors: errors.array(),
			});
			return;
		} else {
			// Data from form is valid.
			// Check if Genre with same name already exists.
			Genre.findOne({ name: req.body.name }).exec(function (err, found_genre) {
				if (err) {
					return next(err);
				}

				if (found_genre) {
					// Genre exists, redirect to its detail page.
					res.redirect(found_genre.url);
				} else {
					genre.save(function (err) {
						if (err) {
							return next(err);
						}
						// Genre saved. Redirect to genre detail page.
						res.redirect(genre.url);
					});
				}
			});
		}
	},
];

// Display Genre delete form on GET.
export async function genre_delete_get(req, res, next) {
	try {
		const [genre, booksInGenre] = await Promise.all([
			Genre.findById(req.params.id).exec(),
			Book.find({ genre: { $in: req.params.id } }).exec(),
		]);

		res.render('genre_delete', {
			title: 'Delete Genre',
			genre: genre,
			booksInGenre: booksInGenre,
		});
	} catch (error) {
		next(error);
	}
}

// Handle Genre delete on POST.
export async function genre_delete_post(req, res, next) {
	try {
		await Genre.findByIdAndDelete(req.params.id);
		res.redirect('/catalog/genres');
	} catch (error) {
		next(error);
	}
}

// Display Genre update form on GET.
export async function genre_update_get(req, res, next) {
	try {
		const genre = await Genre.findById(req.params.id);

		res.render('genre_form', {
			title: 'Update Genre',
			genre: genre,
		});
	} catch (error) {
		next(error);
	}
}

// Handle Genre update on POST.
export const genre_update_post = [
	body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),

	// Process request after validation and sanitization.
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		// Create a genre object with escaped and trimmed data.
		let genre = new Genre({ name: req.body.name, _id: req.params.id });

		if (!errors.isEmpty()) {
			// There are errors. Render the form again with sanitized values/error messages.
			res.render('genre_form', {
				title: 'Create Genre',
				genre: genre,
				errors: errors.array(),
			});
			return;
		} else {
			// Data from form is valid.
			// Check if Genre with same name already exists.
			Genre.findOne({ name: req.body.name }).exec(function (err, found_genre) {
				if (err) {
					return next(err);
				}

				if (found_genre) {
					// Genre exists, redirect to its detail page.
					res.redirect(found_genre.url);
				} else {
					Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err) {
						if (err) {
							return next(err);
						}
						// Genre saved. Redirect to genre detail page.
						res.redirect(genre.url);
					});
				}
			});
		}
	},
];
