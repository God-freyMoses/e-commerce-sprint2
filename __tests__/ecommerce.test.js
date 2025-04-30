//import test from 'node:test';
import { addItem, removeItem, updateQuantity, calculateTotal, toggleItem, validateProducts, fetchProducts } from '../js/ecommerce.js';



describe(' [Cart operations]', () => {

    test("calculates total correctly", () => {
        const cart = [
            { price: 10, quantity: 2 },
            { price: 15, quantity: 1 }
        ];
        expect(calculateTotal(cart)).toBe(35);
    })

    test("adds new Item to cart", () => {
        const cart = [{ id: 1, title: "Product 1", price: 10, quantity: 1 }];
        const product = { id: 2, title: "Product 2", price: 20 };
        const updatedCart = addItem(cart, product);
        expect(updatedCart).toEqual([
            { id: 1, title: "Product 1", price: 10, quantity: 1 },
            { id: 2, title: "Product 2", price: 20, quantity: 1 },
        ]);
    });

    test("removes item from cart", () => {
        const cart = [{ id: 1, title: "Product 1", price: 10, quantity: 1 }];
        const updatedCart = removeItem(cart, 1);
        expect(updatedCart).toEqual([]);
    });
    test("updates item quantity in cart", () => {
        const cart = [{ id: 1, title: "Product 1", price: 10, quantity: 1 }];
        const updatedCart = updateQuantity(cart, 1, 2);
        expect(updatedCart).toEqual([{ id: 1, title: "Product 1", price: 10, quantity: 3 }]);
    });
});

describe(' [Wishlist operations]', () => {
    test("toggles item in wishlist", () => {
        const wishlist = [{ id: 1, title: "Product 1", price: 10 }];
        const product = { id: 2, title: "Product 2", price: 20 };
        const result = toggleItem(wishlist, product);
        expect(result.updatedList).toEqual([
            { id: 1, title: "Product 1", price: 10 },
            { id: 2, title: "Product 2", price: 20 },
        ]);

        //test adding to wishlist
        expect(result.action).toBe('added');


        //test removing from wishlist
        const result2 = toggleItem(result.updatedList, product);
        expect(result2.updatedList).toEqual([{ id: 1, title: "Product 1", price: 10 }]);
        expect(result2.action).toBe('removed');

    });
});

describe(' [Product validation]', () => {
    test("validates product data", () => {
        const validProducts = [{
            id: 1,
            title: "Product 1",
            price: 10,
            description: "A great product",
            thumbnail: "image.jpg",
            rating: 4.5,
            discountPercentage: 10
        }];

        const validated = validateProducts(validProducts);
        expect(validated[0].discountPercentage).toBe(10);
        expect(Number(validated[0].rating)).toBe(4.5);
        expect(validated[0].thumbnail).toBe("image.jpg");
        expect(validated[0].description).toBe("A great product");
        expect(validated[0].price).toBe(10);
    });

    const invalidProduct = {
        id: 2,
        title: "Product 2",
        price: -5,
        description: "A great product",
        category: "Electronics",
        image: "image.jpg",
    };
    const validated2 = validateProducts(invalidProduct);
    expect(validated2[0].discountPercentage).toBe(0);
    expect(validated2[0].rating).toBe(0);
    expect(validated2[0].thumbnail).toBe("image.jpg");
    expect(validated2[0].description).toBe("A great product");

    test("fetches products from API", async () => {
        const products = await fetchProducts();
        expect(products).toBeInstanceOf(Array);
        products.forEach(product => {
            expect(product).toMatchObject({
                id: expect.any(Number),
                title: expect.any(String),
                price: expect.any(Number),
                description: expect.any(String),
                thumbnail: expect.any(String)
            });
        });
        expect(products.length).toBeGreaterThan(0);
        expect(products[0].id).toBe(1);
        expect(products[0].title).toBe("Product 1");
        expect(products[0].price).toBe(10);
        expect(products[0].description).toBe("A great product");
        expect(products[0].thumbnail).toBe("image.jpg");
        expect(products[0].rating).toBe(4.5);
        expect(products[0].category).toBe("Electronics");
        expect(products[0].discountPercentage).toBe(10);
    });
});