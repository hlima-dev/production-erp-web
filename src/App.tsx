import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AppLayout } from './layouts/AppLayout'
import { PrivateRoute } from './routes/PrivateRoute'
import { LoginPage } from './pages/Login/LoginPage'
import { DashboardPage } from './pages/Dashboard/DashboardPage'

// Tudo além de Login/Dashboard (as duas telas mais visitadas) é
// code-split por rota — reduz o bundle inicial, que passou dos 500kB
// só com import estático de todas as ~20 páginas do painel.
const ProductsPage = lazy(() => import('./pages/catalog/ProductsPage').then((m) => ({ default: m.ProductsPage })))
const ProductDetailPage = lazy(() => import('./pages/catalog/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })))
const WarehousesPage = lazy(() => import('./pages/inventory/WarehousesPage').then((m) => ({ default: m.WarehousesPage })))
const StockPage = lazy(() => import('./pages/inventory/StockPage').then((m) => ({ default: m.StockPage })))
const CustomersPage = lazy(() => import('./pages/sales/CustomersPage').then((m) => ({ default: m.CustomersPage })))
const OrdersPage = lazy(() => import('./pages/sales/OrdersPage').then((m) => ({ default: m.OrdersPage })))
const OrderFormPage = lazy(() => import('./pages/sales/OrderFormPage').then((m) => ({ default: m.OrderFormPage })))
const OrderDetailPage = lazy(() => import('./pages/sales/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })))
const ProductionOrdersPage = lazy(() => import('./pages/production/ProductionOrdersPage').then((m) => ({ default: m.ProductionOrdersPage })))
const ProductionOrderFormPage = lazy(() =>
  import('./pages/production/ProductionOrderFormPage').then((m) => ({ default: m.ProductionOrderFormPage })),
)
const ProductionOrderDetailPage = lazy(() =>
  import('./pages/production/ProductionOrderDetailPage').then((m) => ({ default: m.ProductionOrderDetailPage })),
)
const InvoicesPage = lazy(() => import('./pages/fiscal/InvoicesPage').then((m) => ({ default: m.InvoicesPage })))
const InvoiceDetailPage = lazy(() => import('./pages/fiscal/InvoiceDetailPage').then((m) => ({ default: m.InvoiceDetailPage })))
const VehiclesPage = lazy(() => import('./pages/logistics/VehiclesPage').then((m) => ({ default: m.VehiclesPage })))
const DriversPage = lazy(() => import('./pages/logistics/DriversPage').then((m) => ({ default: m.DriversPage })))
const DeliveryManifestsPage = lazy(() =>
  import('./pages/logistics/DeliveryManifestsPage').then((m) => ({ default: m.DeliveryManifestsPage })),
)
const DeliveryManifestFormPage = lazy(() =>
  import('./pages/logistics/DeliveryManifestFormPage').then((m) => ({ default: m.DeliveryManifestFormPage })),
)
const DeliveryManifestDetailPage = lazy(() =>
  import('./pages/logistics/DeliveryManifestDetailPage').then((m) => ({ default: m.DeliveryManifestDetailPage })),
)

function RouteFallback() {
  return (
    <div className="flex justify-center py-16 text-slate-400">
      <Loader2 className="animate-spin" size={24} />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route
          path="*"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="produtos" element={<ProductsPage />} />
                <Route path="produtos/:id" element={<ProductDetailPage />} />
                <Route path="almoxarifados" element={<WarehousesPage />} />
                <Route path="estoque" element={<StockPage />} />
                <Route path="clientes" element={<CustomersPage />} />
                <Route path="pedidos" element={<OrdersPage />} />
                <Route path="pedidos/novo" element={<OrderFormPage />} />
                <Route path="pedidos/:id" element={<OrderDetailPage />} />
                <Route path="pedidos/:id/editar" element={<OrderFormPage />} />
                <Route path="producao" element={<ProductionOrdersPage />} />
                <Route path="producao/nova" element={<ProductionOrderFormPage />} />
                <Route path="producao/:id" element={<ProductionOrderDetailPage />} />
                <Route path="notas-fiscais" element={<InvoicesPage />} />
                <Route path="notas-fiscais/:id" element={<InvoiceDetailPage />} />
                <Route path="veiculos" element={<VehiclesPage />} />
                <Route path="motoristas" element={<DriversPage />} />
                <Route path="romaneios" element={<DeliveryManifestsPage />} />
                <Route path="romaneios/novo" element={<DeliveryManifestFormPage />} />
                <Route path="romaneios/:id" element={<DeliveryManifestDetailPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
