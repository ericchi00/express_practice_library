import express from 'express';

const router = express.Router();

router.get('/', (req, res, next) => {
	res.redirect('/catalog');
});

export default router;
