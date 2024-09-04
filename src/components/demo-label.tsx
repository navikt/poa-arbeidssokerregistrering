interface Props {
    brukerMock?: boolean;
}

function DemoLabel({ brukerMock }: Props) {
    if (!brukerMock) return null;

    return (
        <div className="inset-x-0 top-0 h-16 w-32 -mt-20">
            <div className="text-red-600 text-4xl">DEMO</div>
        </div>
    );
}

export default DemoLabel;
