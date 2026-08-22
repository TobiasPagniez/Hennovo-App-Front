// Acepta dígitos, espacios, +, guiones y paréntesis. Cubre formatos como
// "353 513 7740", "+54 353 513 7740", 154...".
// Ver si no es mejors hacerlo en la api
export const TELEFONO_REGEX = /^[+]?[\d\s()-]{6,20}$/;
