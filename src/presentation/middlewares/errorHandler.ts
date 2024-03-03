import { ErrorRequestHandler } from "express";

const errorHandler:ErrorRequestHandler = (err, req, res, next) => {
	if (err?.message.includes('Not Found') || 
		err?.message.includes('Login failed') ||
		err?.message.includes('User Has Cart Already') ||
		err?.message.includes('Role Already Added') ||
		err?.message.includes('Product Already Added') ||
		err?.message.includes('Empty Cart') ||
		err?.message.includes('Credentials Error')
		) {
		req.logger.error(err.stack);
		return res.status(404).json({ message: err.message });
	} else if (err?.name.includes('ZodError')) {
		console.error(err.stack);
		return res.status(400).json({ message: err.issues });
	}

	req.logger.error(err.stack);
	res.status(500).json({ message: 'Ocurrió un error' });

	next(err);
};

export default errorHandler;

