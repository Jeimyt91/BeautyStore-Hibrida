import test from 'node:test';
import assert from 'node:assert/strict';
import {addToCart,changeQuantity,cartCount,cartTotal} from '../src/cart.js';
import {initialProducts,normalizeProduct} from '../src/data.js';

test('productos originales migrados con sus precios',()=>{
 assert.equal(initialProducts.length,4);
 assert.deepEqual(initialProducts.map(p=>p.precio),[30000,20000,18000,100000]);
});
test('agrega productos al carrito y acumula cantidades',()=>{
 const cart=addToCart(addToCart([],initialProducts[0]),initialProducts[0]);
 assert.equal(cartCount(cart),2);
 assert.equal(cartTotal(cart),60000);
});
test('disminuye y elimina cuando cantidad llega a cero',()=>{
 const cart=addToCart([],initialProducts[1]);
 assert.deepEqual(changeQuantity(cart,2,-1),[]);
});
test('normaliza producto sin URL insegura',()=>{
 assert.equal(normalizeProduct({id:7,nombre:'Masaje',precio:12,imagen:'javascript:alert(1)'}).imagen,'/images/logo.png');
});
