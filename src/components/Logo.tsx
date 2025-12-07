import wenner from '../assets/img/wenner.png'
import { Link } from "react-router-dom";

const Logo = ({
  className = "flex items-center justify-center ",
  imgClassName = "h-9 w-auto mb-3 mt-3",
  alt = "Wenner Logo",
}) => {
  return (
    <Link to="/" className={className}>
      <img src={wenner} alt={alt} className={imgClassName} />
    </Link>
  );
};

export default Logo;
