import KvitteringUnder18Wrapper from '@/components/kvittering-oppgave-under-18-wrapper';
import { KvitteringOppgaveOpprettet } from '@/components/KvitteringOppgaveUnder18';
import { isEnabled } from '@/lib/unleash-is-enabled';
import unleashKeys from '@/unleash-keys';

export default async function Under18() {
    const opprettOppgaveFraHendelse = await isEnabled(unleashKeys.BRUK_OPPGAVE_FRA_HENDELSE);

    return opprettOppgaveFraHendelse ? <KvitteringOppgaveOpprettet /> : <KvitteringUnder18Wrapper />;
}
