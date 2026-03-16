import { KvitteringOppgaveOpprettet } from '@/components/KvitteringOppgaveUnder18';
import SettSprakIDekorator from '@/components/sett-sprak-i-dekorator';
import { NextPageProps } from '@/types/next';

export default async function Under18({ params }: NextPageProps) {
    const lang = (await params).lang;
    return (
        <>
            <SettSprakIDekorator sprak={lang ?? 'nb'} />
            <KvitteringOppgaveOpprettet />
        </>
    );
}
