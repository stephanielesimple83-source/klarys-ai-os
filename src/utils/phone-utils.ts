export type FrenchPhoneKind =
  | 'MOBILE'
  | 'FIXE'
  | 'UNKNOWN';

function normalizePhoneDigits(
  value:
    | string
    | null
    | undefined,
): string {
  if (!value) {
    return '';
  }

  return value
    .trim()
    .replace(/[^\d+]/g, '');
}

function toFrenchNationalNumber(
  value:
    | string
    | null
    | undefined,
): string | null {
  const normalized =
    normalizePhoneDigits(
      value,
    );

  if (!normalized) {
    return null;
  }

  if (
    normalized.startsWith(
      '+33',
    )
  ) {
    const rest =
      normalized.slice(
        3,
      );

    if (
      /^\d{9}$/.test(
        rest,
      )
    ) {
      return `0${rest}`;
    }

    return null;
  }

  if (
    normalized.startsWith(
      '0033',
    )
  ) {
    const rest =
      normalized.slice(
        4,
      );

    if (
      /^\d{9}$/.test(
        rest,
      )
    ) {
      return `0${rest}`;
    }

    return null;
  }

  if (
    /^0\d{9}$/.test(
      normalized,
    )
  ) {
    return normalized;
  }

  return null;
}

export function getFrenchPhoneKind(
  value:
    | string
    | null
    | undefined,
): FrenchPhoneKind {
  const national =
    toFrenchNationalNumber(
      value,
    );

  if (!national) {
    return 'UNKNOWN';
  }

  if (
    national.startsWith(
      '06',
    ) ||
    national.startsWith(
      '07',
    )
  ) {
    return 'MOBILE';
  }

  if (
    national.startsWith(
      '01',
    ) ||
    national.startsWith(
      '02',
    ) ||
    national.startsWith(
      '03',
    ) ||
    national.startsWith(
      '04',
    ) ||
    national.startsWith(
      '05',
    ) ||
    national.startsWith(
      '09',
    )
  ) {
    return 'FIXE';
  }

  return 'UNKNOWN';
}

export function isFrenchMobilePhone(
  value:
    | string
    | null
    | undefined,
): boolean {
  return (
    getFrenchPhoneKind(
      value,
    ) ===
    'MOBILE'
  );
}

export function isFrenchFixedPhone(
  value:
    | string
    | null
    | undefined,
): boolean {
  return (
    getFrenchPhoneKind(
      value,
    ) ===
    'FIXE'
  );
}