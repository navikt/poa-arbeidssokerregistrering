function KanIkkeStartePeriode(props: { feilmelding: any }) {
    const { feilmelding } = props;
    if (!feilmelding) return null;
    return <div>{JSON.stringify(feilmelding, null, 2)}</div>;
}

export default KanIkkeStartePeriode;
