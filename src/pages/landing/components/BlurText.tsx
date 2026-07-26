interface BlurTextProps {
  text: string;
  className?: string;
  splitBy?: 'words' | 'letters';
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

const BlurText = ({
  text,
  className = '',
  splitBy = 'words',
  as: Component = 'h1',
}: BlurTextProps) => {
  const elements = splitBy === 'words' ? text.split(' ') : text.split('');

  return (
    <Component className={className}>
      {elements.map((el, i) => (
        <span
          key={i}
          style={{ display: 'inline-block' }}
        >
          {el}
          {splitBy === 'words' && i < elements.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </Component>
  );
};

export default BlurText;
