import wenner from '../assets/img/wenner.png'

const Logo = ({
  className = "flex items-center justify-center ",
  imgClassName = "h-9 w-auto mb-3 mt-3",
  alt = "Wenner Logo",
}) => {
  return (
    <div className={className}>
      <img src={wenner} alt={alt} className={imgClassName} />
    </div>
  );
};

export default Logo;
