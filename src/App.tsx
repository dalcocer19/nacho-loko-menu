import { useEffect, useMemo, useState } from 'react'
import './App.css'

import { supabase } from './supabase'

// 1. Importas la imagen directamente desde la carpeta assets
// Cambia 'logo.png' por el nombre y extensión exacta de tu archivo
import restaurantLogo from './assets/nacho-loko.jpeg'

// Imagen por defecto si un plato no tiene imagen o la URL falla
const DEFAULT_DISH_IMAGE =
  'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg'

interface CategoryDB {
  id?: number
  name: string
  description?: string
}

interface ProductDB {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  is_available: boolean
  category_id?: number
  categories: CategoryDB | null
}

interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  available: boolean
  category: string
}

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos')
  const [search, setSearch] = useState<string>('')

  /*
   * Cargar datos desde Supabase
   */
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            description,
            price,
            image_url,
            is_available,
            categories (
              name
            )
          `)

        if (error) {
          throw error
        }

        if (data) {
          const formattedProducts: Product[] = (
            data as unknown as ProductDB[]
          ).map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            image_url: item.image_url?.trim() ? item.image_url : DEFAULT_DISH_IMAGE,
            available: item.is_available,
            category: item.categories?.name || 'Sin Categoría',
          }))

          setProducts(formattedProducts)
        }
      } catch (err: any) {
        console.error('Error al obtener los productos:', err.message)
        setError('No se pudieron cargar los productos. Por favor, reintente más tarde.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  /*
   * Las categorías se obtienen dinámicamente
   */
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((product) => product.category))
    )

    return ['Todos', ...uniqueCategories]
  }, [products])

  /*
   * Filtrado por categoría + búsqueda
   */
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Todos' ||
        product.category === selectedCategory

      const searchText = search.toLowerCase().trim()

      const matchesSearch =
        searchText === '' ||
        product.name.toLowerCase().includes(searchText) ||
        product.description.toLowerCase().includes(searchText)

      return matchesCategory && matchesSearch
    })
  }, [products, selectedCategory, search])

  /*
   * Formato del precio
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="app">

      {/* ==========================================
          HEADER
      ========================================== */}
      <header className="header">
        <div className="restaurant-brand">
          <div className="title-with-logo">
          {/* 2. Pasas la variable importada a la propiedad src */}
          <img
            src={restaurantLogo}
            alt="Logo La Fiesta"
            className="restaurant-small-logo"
          />
        </div>
          <div className="brand-text">
            <strong>El Nacho Loko</strong>
            <span>COCINA MEXICANA</span>
          </div>
        </div>

        <button className="language-button">
          <span>◎</span>
          ES
          <span className="language-arrow">⌄</span>
        </button>
      </header>

      {/* ==========================================
          TITULO DEL MENU + LOGO PEQUEÑO LOCAL
      ========================================== */}
      <section className="menu-heading">
        <div className="heading-decoration">
          <span>❯</span>
          <span>❮</span>
        </div>

       
          <h1>Nuestro menú</h1>

        <p>Sabores auténticos, ingredientes frescos</p>
      </section>

      {/* ==========================================
          CONTENIDO
      ========================================== */}
      <main className="menu-content">

        {/* BUSCADOR */}
        <div className="search-box">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Buscar un plato..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search.length > 0 && (
            <button
              className="clear-button"
              onClick={() => setSearch('')}
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>

        {/* MENSAJE DE CARGA O ERROR */}
        {loading && (
          <div className="no-results">
            <p>Cargando nuestro menú...</p>
          </div>
        )}

        {error && (
          <div className="no-results">
            <p style={{ color: 'red' }}>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ==========================================
                CATEGORIAS
            ========================================== */}
            <div className="categories-container">
              {categories.map((category) => (
                <button
                  key={category}
                  className={
                    selectedCategory === category
                      ? 'category active'
                      : 'category'
                  }
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'Tacos' && '🌮 '}
                  {category === 'Entradas' && '🌶️ '}
                  {category === 'Platos' && '🍲 '}
                  {category === 'Bebidas' && '🥤 '}
                  {category}
                </button>
              ))}
            </div>

            {/* ==========================================
                RESULTADOS
            ========================================== */}
            <div className="menu-info">
              <div>
                <span>NUESTRA SELECCIÓN</span>
                 <h2>{selectedCategory}</h2>
              </div>

              <span className="product-count">
                {filteredProducts.length}{' '}
                {filteredProducts.length === 1
                  ? 'producto'
                  : 'productos'}
              </span>
            </div>

            {/* ==========================================
                PRODUCTOS
            ========================================== */}
            <section className="products">
              {filteredProducts.length === 0 ? (
                <div className="no-results">
                  <div className="no-results-icon">🌮</div>
                  <h3>No encontramos ese plato</h3>
                  <p>Prueba buscando otro nombre o categoría.</p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <article
                    className={
                      product.available
                        ? 'product-card'
                        : 'product-card unavailable'
                    }
                    key={product.id}
                  >
                    {/* IMAGEN DE PRODUCTO */}
                    <div className="product-image-wrapper">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="product-image"
                        loading="lazy"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = DEFAULT_DISH_IMAGE
                        }}
                      />

                      {!product.available && (
                        <div className="image-overlay">
                          <span>No disponible</span>
                        </div>
                      )}
                    </div>

                    {/* INFORMACIÓN */}
                    <div className="product-information">
                      <div className="product-category">
                        {product.category}
                      </div>

                      <div className="product-main">
                        <div className="product-details">
                          <h3>{product.name}</h3>
                          <p>{product.description}</p>
                        </div>
                      </div>

                      <div className="product-bottom">
                        <strong className="product-price">
                          {formatPrice(product.price)}
                        </strong>

                        <div
                          className={
                            product.available
                              ? 'availability available'
                              : 'availability unavailable-status'
                          }
                        >
                          <span></span>
                          {product.available
                            ? 'Disponible'
                            : 'No disponible'}
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </section>
          </>
        )}
      </main>

      {/* ==========================================
          FOOTER
      ========================================== */}
      <footer className="footer">
        <div className="footer-notice">
          <div className="notice-item">
            <span className="notice-icon">🌵</span>
            <div>
              <strong>¿Quieres probarte un sombrero mexicano?</strong>
              <p>Consulta a nuestro personal.</p>
            </div>
          </div>

          <div className="notice-divider"></div>

          <div className="notice-item">
            <span className="notice-icon">🌿</span>
            <div>
              <strong>Ingredientes frescos</strong>
              <p>Preparados especialmente para ti.</p>
            </div>
          </div>
        </div>

        <div className="footer-brand">El Nacho Loko</div>

        <small>
          Cocina mexicana · © {new Date().getFullYear()}
        </small>
      </footer>
    </div>
  )
}

export default App

// import { useMemo, useState } from 'react'
// import './App.css'

// interface Product {
//   id: number
//   name: string
//   description: string
//   price: number
//   image_url: string
//   available: boolean
//   category: string
// }

// /*
//  * DATOS DE EJEMPLO
//  *
//  * Más adelante estos datos serán reemplazados
//  * por los datos provenientes de Supabase.
//  */
// const products: Product[] = [
//   {
//     id: 1,
//     name: 'Tacos al Pastor',
//     description:
//       'Carne de cerdo marinada con piña, cilantro, cebolla y nuestra salsa de la casa.',
//     price: 8500,
//     image_url:
//       'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=900&q=85',
//     available: true,
//     category: 'Tacos',
//   },
//   {
//     id: 2,
//     name: 'Guacamole',
//     description:
//       'Aguacate fresco machacado con tomate, cebolla, cilantro y jugo de limón.',
//     price: 6000,
//     image_url:
//       'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85',
//     available: true,
//     category: 'Entradas',
//   },
//   {
//     id: 3,
//     name: 'Quesadillas de Res',
//     description:
//       'Tortilla de harina rellena de carne asada, queso derretido y pimientos.',
//     price: 9500,
//     image_url:
//       'https://images.unsplash.com/photo-1618040996337-56904b7850b9?auto=format&fit=crop&w=900&q=85',
//     available: true,
//     category: 'Platos',
//   },
//   {
//     id: 4,
//     name: 'Burrito de Pollo',
//     description:
//       'Tortilla de harina con pollo a la parrilla, arroz, frijoles, lechuga, pico de gallo y crema.',
//     price: 10500,
//     image_url:
//       'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=85',
//     available: true,
//     category: 'Platos',
//   },
//   {
//     id: 5,
//     name: 'Nachos Mexicanos',
//     description:
//       'Totopos crujientes con queso cheddar, frijoles, jalapeños, guacamole y pico de gallo.',
//     price: 7500,
//     image_url:
//       'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=900&q=85',
//     available: false,
//     category: 'Entradas',
//   },
//   {
//     id: 6,
//     name: 'Tacos de Carnitas',
//     description:
//       'Carnitas de cerdo cocinadas lentamente, acompañadas de cebolla, cilantro y limón.',
//     price: 9000,
//     image_url:
//       'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=900&q=85',
//     available: true,
//     category: 'Tacos',
//   },
//   {
//     id: 7,
//     name: 'Bowl Mexicano',
//     description:
//       'Arroz, frijoles negros, pollo grillado, maíz, pico de gallo, aguacate y crema.',
//     price: 11000,
//     image_url:
//       'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85',
//     available: true,
//     category: 'Platos',
//   },
//   {
//     id: 8,
//     name: 'Margarita Clásica',
//     description:
//       'El clásico mexicano preparado con limón y un toque cítrico.',
//     price: 7500,
//     image_url:
//       'https://images.unsplash.com/photo-1556855810-ac404aa91e85?auto=format&fit=crop&w=900&q=85',
//     available: true,
//     category: 'Bebidas',
//   },
//   {
//     id: 9,
//     name: 'Horchata',
//     description:
//       'Bebida tradicional mexicana de arroz, canela y vainilla.',
//     price: 4500,
//     image_url:
//       'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85',
//     available: true,
//     category: 'Bebidas',
//   },
// ]

// function App() {
//   const [selectedCategory, setSelectedCategory] = useState('Todos')
//   const [search, setSearch] = useState('')

//   /*
//    * Las categorías se generan automáticamente
//    * a partir de los productos.
//    *
//    * Cuando conectemos Supabase, esto seguirá
//    * funcionando sin modificar esta parte.
//    */
//   const categories = useMemo(() => {
//     const uniqueCategories = Array.from(
//       new Set(products.map((product) => product.category)),
//     )

//     return ['Todos', ...uniqueCategories]
//   }, [])

//   /*
//    * Filtrado por categoría + búsqueda
//    */
//   const filteredProducts = useMemo(() => {
//     return products.filter((product) => {
//       const matchesCategory =
//         selectedCategory === 'Todos' ||
//         product.category === selectedCategory

//       const searchText = search.toLowerCase().trim()

//       const matchesSearch =
//         searchText === '' ||
//         product.name.toLowerCase().includes(searchText) ||
//         product.description.toLowerCase().includes(searchText)

//       return matchesCategory && matchesSearch
//     })
//   }, [selectedCategory, search])

//   /*
//    * Formato del precio.
//    *
//    * Esto después puede adaptarse fácilmente
//    * a la moneda que utilice el restaurante.
//    */
//   const formatPrice = (price: number) => {
//     return new Intl.NumberFormat('es-AR', {
//       style: 'currency',
//       currency: 'ARS',
//       maximumFractionDigits: 0,
//     }).format(price)
//   }

//   return (
//     <div className="app">

//       {/* ==========================================
//           HEADER
//       ========================================== */}

//       <header className="header">

//         <div className="restaurant-brand">

//           <div className="brand-icon">
//             🌵
//           </div>

//           <div className="brand-text">
//             <strong>El Nacho Loko</strong>
//             <span>COCINA MEXICANA</span>
//           </div>

//         </div>

//         <button className="language-button">
//           <span>◎</span>
//           ES
//           <span className="language-arrow">⌄</span>
//         </button>

//       </header>

//       {/* ==========================================
//           TITULO DEL MENU
//       ========================================== */}

//       <section className="menu-heading">

//         <div className="heading-decoration">
//           <span>❯</span>
//           <span>❮</span>
//         </div>

//         <h1>Nuestro menú</h1>

//         <p>
//           Sabores auténticos, ingredientes frescos
//         </p>

//       </section>

//       {/* ==========================================
//           CONTENIDO
//       ========================================== */}

//       <main className="menu-content">

//         {/* BUSCADOR */}

//         <div className="search-box">

//           <span className="search-icon">
//             ⌕
//           </span>

//           <input
//             type="text"
//             placeholder="Buscar un plato..."
//             value={search}
//             onChange={(event) => setSearch(event.target.value)}
//           />

//           {search.length > 0 && (
//             <button
//               className="clear-button"
//               onClick={() => setSearch('')}
//               aria-label="Limpiar búsqueda"
//             >
//               ×
//             </button>
//           )}

//         </div>

//         {/* ==========================================
//             CATEGORIAS
//         ========================================== */}

//         <div className="categories-container">

//           {categories.map((category) => (

//             <button
//               key={category}
//               className={
//                 selectedCategory === category
//                   ? 'category active'
//                   : 'category'
//               }
//               onClick={() => setSelectedCategory(category)}
//             >

//               {category === 'Tacos' && '🌮 '}
//               {category === 'Entradas' && '🌶️ '}
//               {category === 'Platos' && '🍲 '}
//               {category === 'Bebidas' && '🥤 '}

//               {category}

//             </button>

//           ))}

//         </div>

//         {/* ==========================================
//             RESULTADOS
//         ========================================== */}

//         <div className="menu-info">

//           <div>
//             <span>NUESTRA SELECCIÓN</span>

//             <h2>
//               {selectedCategory}
//             </h2>
//           </div>

//           <span className="product-count">
//             {filteredProducts.length}{' '}
//             {filteredProducts.length === 1
//               ? 'producto'
//               : 'productos'}
//           </span>

//         </div>

//         {/* ==========================================
//             PRODUCTOS
//         ========================================== */}

//         <section className="products">

//           {filteredProducts.length === 0 ? (

//             <div className="no-results">

//               <div className="no-results-icon">
//                 🌮
//               </div>

//               <h3>
//                 No encontramos ese plato
//               </h3>

//               <p>
//                 Prueba buscando otro nombre o categoría.
//               </p>

//             </div>

//           ) : (

//             filteredProducts.map((product) => (

//               <article
//                 className={
//                   product.available
//                     ? 'product-card'
//                     : 'product-card unavailable'
//                 }
//                 key={product.id}
//               >

//                 {/* IMAGEN */}

//                 <div className="product-image-wrapper">

//                   <img
//                     src={product.image_url}
//                     alt={product.name}
//                     className="product-image"
//                     loading="lazy"
//                   />

//                   {!product.available && (
//                     <div className="image-overlay">
//                       <span>
//                         No disponible
//                       </span>
//                     </div>
//                   )}

//                 </div>

//                 {/* INFORMACIÓN */}

//                 <div className="product-information">

//                   <div className="product-category">
//                     {product.category}
//                   </div>

//                   <div className="product-main">

//                     <div className="product-details">

//                       <h3>
//                         {product.name}
//                       </h3>

//                       <p>
//                         {product.description}
//                       </p>

//                     </div>

//                   </div>

//                   <div className="product-bottom">

//                     <strong className="product-price">
//                       {formatPrice(product.price)}
//                     </strong>

//                     <div
//                       className={
//                         product.available
//                           ? 'availability available'
//                           : 'availability unavailable-status'
//                       }
//                     >

//                       <span></span>

//                       {product.available
//                         ? 'Disponible'
//                         : 'No disponible'}

//                     </div>

//                   </div>

//                 </div>

//               </article>

//             ))

//           )}

//         </section>

//       </main>

//       {/* ==========================================
//           FOOTER
//       ========================================== */}

//       <footer className="footer">

//         <div className="footer-notice">

//           <div className="notice-item">

//             <span className="notice-icon">
//               🌶️
//             </span>

//             <div>
//               <strong>
//                 ¿Tienes alguna alergia?
//               </strong>

//               <p>
//                 Consulta a nuestro personal.
//               </p>
//             </div>

//           </div>

//           <div className="notice-divider"></div>

//           <div className="notice-item">

//             <span className="notice-icon">
//               🌿
//             </span>

//             <div>
//               <strong>
//                 Ingredientes frescos
//               </strong>

//               <p>
//                 Preparados especialmente para ti.
//               </p>
//             </div>

//           </div>

//         </div>

//         <div className="footer-brand">
//           LA FIESTA
//         </div>

//         <small>
//           Cocina mexicana · © {new Date().getFullYear()}
//         </small>

//       </footer>

//     </div>
//   )
// }

// export default App