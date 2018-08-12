import Ajv from 'ajv';
import { inspect } from 'util';
import * as T from './schema-types';

const ajvErrors = new Ajv({ format: 'full', allErrors: true, verbose: true });
const ajvSimple = new Ajv({ format: 'full' });

export function validatorFor(schema) {
  const validate = ajvErrors.compile(schema);
  return function schemaValidator(data) {
    const isValid = validate(data);
    const errors = validate.errors;
    validate.errors = null;
    return { isValid, errors, errorsStr: formatErrors(errors) };
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

function formatError({ dataPath, message, data, schema }) {
  return [
    dataPath
      ? `Property at ${dataPath} doesn't match schema`
      : `Checked value doesn't match schema`,
    `  Reason: ${message}`,
    `  Value:`,
    `    ${inspect(data, { depth: 0, colors: true })
      .split('\n')
      .join('\n    ')}`,
    `  Schema:`,
    `    ${inspect(schema, { depth: 0, colors: true })
      .split('\n')
      .join('\n    ')}`,
    ``,
  ].join('\n');
}

function formatErrors(errors) {
  return errors
    ? errors.map((err, i) => `[${i + 1}] ${formatError(err)}`).join('\n')
    : '';
}

export function assertFor(schema) {
  const validate = validatorFor(schema);
  return function assertSchemaCompliance(data) {
    const result = validate(data);
    if (result.isValid) {
      return true;
    }
    if (result.errors) {
      throw Error(formatErrors(result.errors));
    }
    throw Error(`Schema validation error`);
  };
}
