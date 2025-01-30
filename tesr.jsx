const Rating = () => {
  const [selectedStar,setSelectedStar]=useState(null);

  const handleRating = (index) => {
    setSelectedStar(index)
  }
  
  return (
    <div id="rating">
    [...Array(5).fill("*").map((star,i) => {
      return <span key={i} className={`${i < selectedStar ? "active": ""}`}>{star}</span>
    })]
    </div>
  )
}