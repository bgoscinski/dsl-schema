import Ajv from 'ajv';
const ajvErrors = new Ajv({ allErrors: true });
const ajvSimple = new Ajv();

export function validatorFor(schema) {
  const validate = ajvErrors.compile(schema);
  return function schemaValidator(data) {
    const isValid = validate(data);
    const errors = validate.errors;
    validate.errors = null;
    return { isValid, errors };
  };
}

export function predicateFor(schema) {
  const validate = ajvSimple.compile(schema);
  return function schemaPredicate(data) {
    const isValid = validate(data);
    validate.errors = null;
    return isValid;
  };
}
