import { KvitteringOppgaveOpprettet } from '@/components/KvitteringOppgaveUnder18';
import KvitteringUnder18Wrapper from '@/components/kvittering-oppgave-under-18-wrapper';
import SettSprakIDekorator from '@/components/sett-sprak-i-dekorator';
import { isEnabled } from '@/lib/unleash-is-enabled';
import type { NextPageProps } from '@/types/next';
import unleashKeys from '@/unleash-keys';

export default async function Under18({ params }: NextPageProps) {
    const { lang } = await params;
    const opprettOppgaveFraHendelse = await isEnabled(unleashKeys.BRUK_OPPGAVE_FRA_HENDELSE);

    return (
        <>
            <SettSprakIDekorator sprak={lang ?? 'nb'} />
            {opprettOppgaveFraHendelse ? <KvitteringOppgaveOpprettet /> : <KvitteringUnder18Wrapper />}
        </>
    );
}
