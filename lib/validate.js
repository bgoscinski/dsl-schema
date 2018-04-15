import Ajv from 'ajv';
const ajv = new Ajv({ allErrors: true });

export function validatorFor(schema) {
  const validate = ajv.compile(schema);
  return function schemaValidator(data) {
    const isValid = validate(data);
    const errors = validate.errors;
    validate.errors = null;
    return { isValid, errors };
  };
}
