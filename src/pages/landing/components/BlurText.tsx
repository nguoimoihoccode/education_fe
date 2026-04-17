import { useEffect, useRef, useState } from 'react';
import { motion, type Variant } from 'framer-motion';

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  direction?: 'top' | 'bottom';
  splitBy?: 'words' | 'letters';
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

const BlurText = ({
  text,
  className = '',
  delay = 200,
  direction = 'bottom',
  splitBy = 'words',
  as: Component = 'h1',
}: BlurTextProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const elements = splitBy === 'words' ? text.split(' ') : text.split('');

  const yInitial = direction === 'bottom' ? 50 : -50;

  const hiddenVariant: Variant = { filter: 'blur(10px)', opacity: 0, y: yInitial };
  const visibleVariant: Variant = { filter: 'blur(0px)', opacity: 1, y: 0 };

  return (
    <Component className={className} ref={ref as React.RefObject<HTMLHeadingElement>}>
      {elements.map((el, i) => (
        <motion.span
          key={i}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          variants={{
            hidden: hiddenVariant,
            visible: visibleVariant,
          }}
          transition={{
            duration: 0.7,
            delay: (i * delay) / 1000,
            ease: 'easeOut',
          }}
          style={{ display: 'inline-block', willChange: 'filter, opacity, transform' }}
        >
          {el}
          {splitBy === 'words' && i < elements.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </Component>
  );
};

export default BlurText;
