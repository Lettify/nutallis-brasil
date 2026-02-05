import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Heart, ShoppingBag, Minus, Plus, ChevronRight, Star, Truck, Shield, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { TRPCClientError } from "@trpc/client";

// Mock product data
const mockProduct = {
  id: 1,
  name: "Castanha do Pará Premium",
  slug: "castanha-do-para-premium",
  price: 89.90,
  compareAtPrice: 109.90,
  images: [
    "/images/brazil-nuts-1.jpg",
    "/images/brazil-nuts-2.jpg",
    "/images/mixed-nuts-1.jpg",
  ],
  category: "Castanhas",
  shortDescription: "Castanhas selecionadas da Amazônia brasileira, colhidas de forma sustentável.",
  description:
    "As Castanhas do Para Premium da Nutallis sao cuidadosamente selecionadas das florestas da Amazonia brasileira. Cada castanha passa por um rigoroso processo de selecao para garantir apenas o melhor em sua mesa.\n\nRicas em selenio, um poderoso antioxidante, nossas castanhas sao perfeitas para quem busca uma alimentacao saudavel sem abrir mao do sabor. O selenio contribui para a saude da tireoide, fortalece o sistema imunologico e protege as celulas contra danos oxidativos.\n\nNossa colheita e realizada de forma sustentavel, respeitando o ciclo natural da floresta e apoiando as comunidades locais. Ao escolher Nutallis, voce esta contribuindo para a preservacao da Amazonia.",
  nutritionalInfo: {
    servingSize: "30g (aproximadamente 3 unidades)",
    calories: 186,
    totalFat: 19,
    saturatedFat: 4.3,
    transFat: 0,
    cholesterol: 0,
    sodium: 1,
    totalCarbs: 3.5,
    fiber: 2.1,
    sugars: 0.7,
    protein: 4.1,
    selenium: "544mcg (989% VD)",
    magnesium: "107mg (41% VD)",
    phosphorus: "206mg (29% VD)",
  },
  harmonization: [
    "Chocolate amargo 70%",
    "Mel de abelhas silvestres",
    "Queijos maturados",
    "Vinhos tintos encorpados",
    "Frutas secas como damascos e tâmaras",
  ],
  origin: "Amazônia, Brasil",
  stock: 50,
  sku: "NUT-CP-001",
  weight: "200g",
};

const relatedProducts = [
  {
    id: 2,
    name: "Mix Gourmet Tropical",
    slug: "mix-gourmet-tropical",
    price: 79.90,
    image: "/images/mixed-nuts-1.jpg",
  },
  {
    id: 3,
    name: "Castanha de Caju Torrada",
    slug: "castanha-de-caju-torrada",
    price: 69.90,
    image: "/images/mixed-nuts-2.jpg",
  },
  {
    id: 4,
    name: "Mix Energia Plus",
    slug: "mix-energia-plus",
    price: 94.90,
    image: "/images/nuts-tray.jpg",
  },
];

export default function ProductDetail() {
  const { slug } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const [product, setProduct] = useState(mockProduct);
  const [productImages, setProductImages] = useState(mockProduct.images);
  const [categoryName, setCategoryName] = useState(mockProduct.category);
  const [related, setRelated] = useState(relatedProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const addToCartMutation = trpc.cart.add.useMutation();

  useEffect(() => {
    let isMounted = true;

    const toNumber = (value: unknown, fallback = 0) => {
      if (value === null || value === undefined) return fallback;
      const numeric = typeof value === "number" ? value : Number(value);
      return Number.isFinite(numeric) ? numeric : fallback;
    };

    const normalizeHarmonization = (value: unknown) => {
      if (!value || typeof value !== "string") return [] as string[];
      const byLine = value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
      if (byLine.length > 1) return byLine;
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    };

    const loadProduct = async () => {
      if (!slug) return;

      setIsLoading(true);
      setHasLoadError(false);
      setNotFound(false);
      setProduct(mockProduct);
      setProductImages(mockProduct.images);
      setCategoryName(mockProduct.category);

      const { data: productRow, error } = await supabase
        .from("products")
        .select(
          "id,name,slug,price,compareAtPrice,description,shortDescription,stock,sku,weight,origin,nutritionalInfo,harmonization,categoryId,isActive"
        )
        .eq("slug", slug)
        .eq("isActive", true)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        setHasLoadError(true);
        setIsLoading(false);
        return;
      }

      if (!productRow) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      const [{ data: categoryRow }, { data: imageRows }] = await Promise.all([
        supabase
          .from("categories")
          .select("name,slug")
          .eq("id", productRow.categoryId)
          .maybeSingle(),
        supabase
          .from("productImages")
          .select("url,displayOrder")
          .eq("productId", productRow.id)
          .order("displayOrder", { ascending: true }),
      ]);

      if (!isMounted) return;

      const imageUrls = imageRows?.map((row) => row.url) ?? [];
      const normalizedWeight = productRow.weight
        ? `${toNumber(productRow.weight, 0)}g`
        : "";
      const normalizedNutrition =
        productRow.nutritionalInfo &&
        typeof productRow.nutritionalInfo === "object" &&
        !Array.isArray(productRow.nutritionalInfo)
          ? productRow.nutritionalInfo
          : undefined;
      const harmonization = normalizeHarmonization(productRow.harmonization);

      setProduct({
        id: productRow.id,
        name: productRow.name,
        slug: productRow.slug,
        price: toNumber(productRow.price, 0),
        compareAtPrice: productRow.compareAtPrice
          ? toNumber(productRow.compareAtPrice, 0)
          : undefined,
        images: imageUrls.length > 0 ? imageUrls : mockProduct.images,
        category: categoryRow?.name ?? mockProduct.category,
        shortDescription:
          productRow.shortDescription ?? "Curadoria Nutallis",
        description:
          productRow.description ??
          "Descricao detalhada em breve.\nCuradoria premium, textura impecavel e frescor absoluto.",
        nutritionalInfo: normalizedNutrition ?? mockProduct.nutritionalInfo,
        harmonization: harmonization.length > 0 ? harmonization : mockProduct.harmonization,
        origin: productRow.origin ?? mockProduct.origin,
        stock: productRow.stock ?? 0,
        sku: productRow.sku ?? mockProduct.sku,
        weight: normalizedWeight || mockProduct.weight,
      });

      setProductImages(imageUrls.length > 0 ? imageUrls : mockProduct.images);
      setSelectedImage(0);
      setCategoryName(categoryRow?.name ?? mockProduct.category);

      const relatedQuery = supabase
        .from("products")
        .select("id,name,slug,price,categoryId")
        .eq("isActive", true)
        .neq("id", productRow.id)
        .order("createdAt", { ascending: false })
        .limit(3);

      const { data: relatedRows } = productRow.categoryId
        ? await relatedQuery.eq("categoryId", productRow.categoryId)
        : await relatedQuery;

      const relatedIds = relatedRows?.map((row) => row.id) ?? [];
      const { data: relatedImages } = relatedIds.length
        ? await supabase
            .from("productImages")
            .select("productId,url,displayOrder")
            .in("productId", relatedIds)
            .order("displayOrder", { ascending: true })
        : { data: [] };

      const relatedImageMap = new Map<number, string>();
      relatedImages?.forEach((row) => {
        if (!relatedImageMap.has(row.productId)) {
          relatedImageMap.set(row.productId, row.url);
        }
      });

      const relatedFallbackImages = relatedProducts.map((item) => item.image);

      setRelated(
        relatedRows && relatedRows.length > 0
          ? relatedRows.map((row, index) => ({
              id: row.id,
              name: row.name,
              slug: row.slug,
              price: toNumber(row.price, 0),
              image:
                relatedImageMap.get(row.id) ||
                relatedFallbackImages[index % relatedFallbackImages.length] ||
                "/images/brazil-nuts-1.jpg",
            }))
          : relatedProducts
      );

      setIsLoading(false);
    };

    void loadProduct();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const addToCart = async () => {
    if (!product?.id) return;

    if (!isAuthenticated && !authLoading) {
      toast.error("Faca login para adicionar ao carrinho");
      await startLogin(`/produto/${product.slug}`);
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity,
      });
      toast.success(`${quantity}x ${product.name} adicionado ao carrinho!`);
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        await startLogin(`/produto/${product.slug}`);
        return;
      }
      toast.error("Nao foi possivel adicionar ao carrinho");
    }
  };

  const addToWishlist = () => {
    toast.success(`${product.name} adicionado aos favoritos!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-perla-dark pt-24 pb-4">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/">
              <span className="hover:text-ouro transition-colors">Início</span>
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/shop">
              <span className="hover:text-ouro transition-colors">Produtos</span>
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-cacau">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {isLoading && (
          <div className="mb-8 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Carregando produto...
          </div>
        )}
        {notFound ? (
          <div className="py-20 text-center">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-cacau mb-4">
              Produto nao encontrado
            </h1>
            <p className="text-muted-foreground mb-6">
              Verifique o link ou explore nossa selecao completa.
            </p>
            <Link href="/shop">
              <Button className="btn-gold">Ver produtos</Button>
            </Link>
          </div>
        ) : (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div
              className="relative aspect-square rounded-xl overflow-hidden cursor-zoom-in"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isZoomed ? "scale-150" : ""
                }`}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }
                    : undefined
                }
              />
              {product.compareAtPrice && (
                <span className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm px-3 py-1 rounded">
                  -{Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index
                      ? "border-ouro"
                      : "border-transparent hover:border-ouro/50"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <span className="text-ouro text-sm font-medium tracking-wider uppercase">
              {categoryName}
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-cacau mt-2">
              {product.name}
            </h1>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mt-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-ouro text-ouro" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(24 avaliações)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mt-6">
              <span className="text-3xl font-bold text-cacau">
                R$ {product.price.toFixed(2).replace(".", ",")}
              </span>
              {product.compareAtPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  R$ {product.compareAtPrice.toFixed(2).replace(".", ",")}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ou 3x de R$ {(product.price / 3).toFixed(2).replace(".", ",")} sem juros
            </p>

            {/* Short Description */}
            <p className="text-foreground/80 mt-6">
              {product.shortDescription}
            </p>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mt-8">
              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button className="flex-1 btn-gold py-6" onClick={addToCart}>
                <ShoppingBag className="h-5 w-5 mr-2" />
                Adicionar ao Carrinho
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12"
                onClick={addToWishlist}
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Stock Info */}
            <p className="text-sm text-muted-foreground mt-4">
              {product.stock > 10
                ? "Em estoque"
                : product.stock > 0
                ? `Apenas ${product.stock} unidades restantes`
                : "Produto esgotado"}
            </p>

            {hasLoadError && (
              <div className="mt-4 rounded-lg border border-ouro/30 bg-ouro/10 px-4 py-3 text-sm text-cacau">
                Nao foi possivel carregar os dados em tempo real. Exibindo uma versao local.
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-border">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto text-ouro" />
                <p className="text-xs text-muted-foreground mt-2">
                  Frete Grátis acima de R$150
                </p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto text-ouro" />
                <p className="text-xs text-muted-foreground mt-2">
                  Compra 100% Segura
                </p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-6 w-6 mx-auto text-ouro" />
                <p className="text-xs text-muted-foreground mt-2">
                  Troca em até 7 dias
                </p>
              </div>
            </div>

            {/* Product Details */}
            <div className="mt-8 pt-8 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="ml-2 text-cacau">{product.sku}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Peso:</span>
                  <span className="ml-2 text-cacau">{product.weight}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Origem:</span>
                  <span className="ml-2 text-cacau">{product.origin}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <Tabs defaultValue="description" className="mt-16">
          <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0">
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-ouro data-[state=active]:bg-transparent px-6 py-3"
            >
              Descrição
            </TabsTrigger>
            <TabsTrigger
              value="nutrition"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-ouro data-[state=active]:bg-transparent px-6 py-3"
            >
              Informação Nutricional
            </TabsTrigger>
            <TabsTrigger
              value="harmonization"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-ouro data-[state=active]:bg-transparent px-6 py-3"
            >
              Harmonização
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-8">
            <div className="prose prose-lg max-w-none text-foreground/80 whitespace-pre-line">
              {product.description}
            </div>
          </TabsContent>

          <TabsContent value="nutrition" className="mt-8">
            <Accordion type="single" collapsible defaultValue="nutrition">
              <AccordionItem value="nutrition" className="border rounded-lg px-6">
                <AccordionTrigger className="text-lg font-serif">
                  Tabela Nutricional
                </AccordionTrigger>
                <AccordionContent>
                  {product.nutritionalInfo ? (
                    <div className="space-y-3 py-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Porcao: {product.nutritionalInfo.servingSize}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(product.nutritionalInfo)
                          .filter(([key]) => key !== "servingSize")
                          .map(([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between py-2 border-b border-border"
                            >
                              <span className="text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <span className="font-medium">
                                {typeof value === "number" ? `${value}g` : value}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-sm text-muted-foreground">
                      Informacao nutricional em breve.
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="harmonization" className="mt-8">
            <div className="bg-card rounded-lg p-6">
              <h3 className="font-serif text-xl font-semibold text-cacau mb-4">
                Sugestões de Harmonização
              </h3>
              <p className="text-muted-foreground mb-6">
                Descubra combinações perfeitas para realçar o sabor das nossas castanhas:
              </p>
              <ul className="space-y-3">
                {product.harmonization.map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-ouro" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        <section className="mt-20">
          <h2 className="text-2xl font-serif font-bold text-cacau mb-8">
            Produtos Relacionados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((relatedProduct) => (
              <Link key={relatedProduct.id} href={`/produto/${relatedProduct.slug}`}>
                <Card className="group product-card border-0 shadow-md overflow-hidden cursor-pointer">
                  <div className="relative aspect-square image-zoom-container">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover product-image"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-serif font-semibold text-cacau group-hover:text-ouro transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-lg font-bold text-cacau mt-2">
                      R$ {relatedProduct.price.toFixed(2).replace(".", ",")}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
        </>
      )}
      </div>

      <Footer />
    </div>
  );
}
