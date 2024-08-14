import React, { useRef, useState, useEffect } from 'react';
import ItemPic from './itempic1'; // Assuming ItemPic is your component for displaying individual products
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Arrow icons

const ProductListByCategory = ({ products, email }) => {
  const categoryRefs = useRef([]);
  const [showArrows, setShowArrows] = useState([]);

  // Get unique mcategories
  const mcategories = [...new Set(products.map(product => product.mcategory))];

  useEffect(() => {
    const handleScroll = () => {
      categoryRefs.current.forEach((container, index) => {
        if (container) {
          const { scrollLeft, scrollWidth, clientWidth } = container;
          const isAtStart = scrollLeft === 0;
          const isAtEnd = scrollLeft + clientWidth >= scrollWidth;

          setShowArrows(prevState => {
            const newShowArrows = [...prevState];
            newShowArrows[index] = {
              left: !isAtStart,
              right: !isAtEnd,
            };
            return newShowArrows;
          });
        }
      });
    };

    // Initial check
    handleScroll();

    // Add scroll event listener
    categoryRefs.current.forEach(container => {
      if (container) {
        container.addEventListener('scroll', handleScroll);
      }
    });

    // Clean up event listeners on unmount
    return () => {
      categoryRefs.current.forEach(container => {
        if (container) {
          container.removeEventListener('scroll', handleScroll);
        }
      });
    };
  }, []);

  const scrollLeft = (index) => {
    const container = categoryRefs.current[index];
    if (container) {
      container.scrollBy({
        left: -container.clientWidth,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = (index) => {
    const container = categoryRefs.current[index];
    if (container) {
      container.scrollBy({
        left: container.clientWidth,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="products-container">
      {mcategories.map((mcategory, mIndex) => {
        // Filter products by mcategory
        const filteredByMCategory = products.filter(product => product.mcategory === mcategory);

        // Get unique categories (colors) within this mcategory
        const categories = [...new Set(filteredByMCategory.map(product => product.category))];

        return (
          <div key={mcategory} className="mcategory-section">
            <h2>{mcategory}</h2>
            {categories.map((category, cIndex) => (
              <div
                key={category}
                className={`category-section ${showArrows[mIndex] ? 'show-arrows' : ''}`}
                ref={el => (categoryRefs.current[mIndex] = el)}
              >
                <h3>{category}</h3>
                <div className="category-products">
                  {filteredByMCategory
                    .filter(product => product.category === category)
                    .map(product => (
                      <ItemPic key={product.productId} itempi={product} email={email} />
                    ))}
                </div>
                {filteredByMCategory.length > 3 && (
                  <>
                    {showArrows[mIndex]?.left && (
                      <button className="arrow-button left" onClick={() => scrollLeft(mIndex)}>
                        <FaChevronLeft className="arrow-icon" />
                      </button>
                    )}
                    {showArrows[mIndex]?.right && (
                      <button className="arrow-button right" onClick={() => scrollRight(mIndex)}>
                        <FaChevronRight className="arrow-icon" />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default ProductListByCategory;
