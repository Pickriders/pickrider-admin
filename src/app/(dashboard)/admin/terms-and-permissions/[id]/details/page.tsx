export async function generateStaticParams() {
  return Array(20)
    .fill(0)
    .map((_, id) => ({
      id: `${id}`,
    }));
}

const DetailsPage = () => {
  return <div>DetailsPage</div>;
};
export default DetailsPage;
