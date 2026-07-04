export interface QueryBuilderResult {
    text: string;
    values: any[];
}

const isDefinedValue = (value: unknown) => value !== undefined && value !== null;
const safeIdentifierRegex = /^[_a-zA-Z][_a-zA-Z0-9]*$/;

const validateIdentifier = (identifier: string) => {
    if (!safeIdentifierRegex.test(identifier)) {
        throw new Error(`Invalid SQL identifier: ${identifier}`);
    }
};

export const buildInsertQuery = (
    table: string,
    baseFields: Record<string, unknown>,
    payload: Record<string, unknown>,
    returning: string = '*',
    excludeKeys: string[] = [],
    allowedColumns?: string[]
): QueryBuilderResult => {
    validateIdentifier(table);
    const baseKeys = Object.keys(baseFields);
    baseKeys.forEach(validateIdentifier);

    const insertKeys = Object.keys(payload).filter((key) => {
        if (!isDefinedValue(payload[key])) return false;
        if (excludeKeys.includes(key)) return false;
        if (!safeIdentifierRegex.test(key)) return false;
        if (allowedColumns && !allowedColumns.includes(key)) return false;
        return true;
    });

    const columns = [...baseKeys, ...insertKeys];
    const values = [...baseKeys.map((key) => baseFields[key]), ...insertKeys.map((key) => payload[key])];
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');

    return {
        text: `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING ${returning};`,
        values,
    };
};

export const buildUpdateQuery = (
    table: string,
    payload: Record<string, unknown>,
    where: Record<string, unknown>,
    returning: string = '*',
    excludeKeys: string[] = [],
    allowedColumns?: string[]
): QueryBuilderResult => {
    validateIdentifier(table);
    const whereKeys = Object.keys(where);
    whereKeys.forEach(validateIdentifier);

    const updateKeys = Object.keys(payload).filter((key) => {
        if (key === 'updated_at') return false;
        if (!isDefinedValue(payload[key])) return false;
        if (excludeKeys.includes(key)) return false;
        if (!safeIdentifierRegex.test(key)) return false;
        if (allowedColumns && !allowedColumns.includes(key)) return false;
        return true;
    });

    if (updateKeys.length === 0) {
        throw new Error('ValidationError: No fields provided for update');
    }

    const setClauses = updateKeys.map((key, index) => `${key} = $${index + 1}`);
    const whereClause = whereKeys
        .map((key, index) => `${key} = $${updateKeys.length + index + 1}`)
        .join(' AND ');

    const values = [...updateKeys.map((key) => payload[key]), ...whereKeys.map((key) => where[key])];

    return {
        text: `UPDATE ${table} SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE ${whereClause} RETURNING ${returning};`,
        values,
    };
};
