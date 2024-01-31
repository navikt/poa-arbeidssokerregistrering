import { withAuthenticatedPage } from '../../auth/withAuthentication';

export const getServerSideProps = withAuthenticatedPage(async (context) => {
    return {
        redirect: {
            destination: `/start`,
            permanent: false,
        },
    };
});

const Empty = () => <></>;
export default Empty;
