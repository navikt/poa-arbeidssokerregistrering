import { createRemoteJWKSet, FlattenedJWSInput, JWSHeaderParameters, JWTPayload, jwtVerify } from 'jose';

let tokenxJWKSet: (protectedHeader?: JWSHeaderParameters, token?: FlattenedJWSInput) => Promise<CryptoKey>;
const getTokenXJwkSet = () => {
    if (!tokenxJWKSet) {
        tokenxJWKSet = createRemoteJWKSet(new URL(process.env.TOKEN_X_JWKS_URI!));
    }

    return tokenxJWKSet;
};

let idPortenJWKSet: (protectedHeader?: JWSHeaderParameters, token?: FlattenedJWSInput) => Promise<CryptoKey>;
const getIdPortenJwkSet = () => {
    if (!idPortenJWKSet) {
        idPortenJWKSet = createRemoteJWKSet(new URL(process.env.IDPORTEN_JWKS_URI!));
    }

    return idPortenJWKSet;
};

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
