import { createRemoteJWKSet, FlattenedJWSInput, JWSHeaderParameters, JWTPayload, jwtVerify, KeyLike } from 'jose';

let tokenxJWKSet: (protectedHeader?: JWSHeaderParameters, token?: FlattenedJWSInput) => Promise<KeyLike>;
const getTokenXJwkSet = () => {
    if (!tokenxJWKSet) {
        tokenxJWKSet = createRemoteJWKSet<KeyLike>(new URL(process.env.TOKEN_X_JWKS_URI!));
    }

    return tokenxJWKSet;
};

let idPortenJWKSet: (protectedHeader?: JWSHeaderParameters, token?: FlattenedJWSInput) => Promise<KeyLike>;
const getIdPortenJwkSet = () => {
    if (!idPortenJWKSet) {
        idPortenJWKSet = createRemoteJWKSet<KeyLike>(new URL(process.env.IDPORTEN_JWKS_URI!));
    }

    return idPortenJWKSet;
};

export type AuthLevel = 'Level3' | 'Level4' | 'idporten-loa-substantial' | 'idporten-loa-high';
export type ValidatedRequest = Request & { user: { level: AuthLevel; ident: string; fnr: string } };

function isTokenX(decodedToken: JWTPayload) {
    return decodedToken?.iss === process.env.TOKEN_X_ISSUER;
}

export async function verifyToken(token: string, decodedToken: JWTPayload) {
    if (isTokenX(decodedToken)) {
        return await jwtVerify(token, getTokenXJwkSet(), {
            algorithms: ['RS256'],
        });
    } else {
        return await jwtVerify(token, getIdPortenJwkSet(), {
            algorithms: ['RS256'],
        });
    }
}
