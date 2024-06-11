import { ErrorTypes } from './error';

export enum RegistreringType {
    ORDINAER_REGISTRERING = 'ORDINAER_REGISTRERING',
    UNDER_18 = 'UNDER_18',
}

export interface FullforRegistreringResponse {
    type?: ErrorTypes;
}
