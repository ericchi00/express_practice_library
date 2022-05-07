import mongoose from 'mongoose';
import { differenceInYears, format } from 'date-fns';

const { Schema } = mongoose;

const AuthorSchema = new Schema({
	first_name: { type: String, required: true, maxLength: 100 },
	family_name: { type: String, required: true, maxLength: 100 },
	date_of_birth: { type: Date },
	date_of_death: { type: Date },
});

AuthorSchema.virtual('name').get(function () {
	let fullname = '';
	if (this.first_name && this.family_name) {
		fullname = this.family_name + ',' + this.first_name;
	}
	if (!this.first_name || !this.family_name) {
		fullname = '';
	}
	return fullname;
});

AuthorSchema.virtual('lifespan').get(function () {
	const lifetime_string = '';
	if (this.date_of_birth) {
		lifetime_string = this.date_of_birth.getYear().toString();
	}
	lifetime_string += ' _ ';
	if (this.date_of_death) {
		lifetime_string += this.date_of_death.getYear();
	}
	return lifetime_string;
});

AuthorSchema.virtual('url').get(function () {
	return '/catalog/author/' + this._id;
});

AuthorSchema.virtual('formatted_age').get(function () {
	if (this.date_of_birth && this.date_of_death) {
		return differenceInYears(
			new Date(this.date_of_death),
			new Date(this.date_of_birth)
		);
	} else if (
		this.date_of_birth &&
		(this.date_of_death === null || this.date_of_death === undefined)
	) {
		return differenceInYears(new Date(), new Date(this.date_of_birth));
	} else {
		return 'no associated birthdate or death date';
	}
});

AuthorSchema.virtual('birthFormatted').get(function () {
	if (this.date_of_birth === null) return;
	return format(this.date_of_birth, 'yyyy-MM-dd');
});

AuthorSchema.virtual('deathFormatted').get(function () {
	if (this.date_of_death === null) return;
	return format(this.date_of_death, 'yyyy-MM-dd');
});

export default mongoose.model('Author', AuthorSchema);
