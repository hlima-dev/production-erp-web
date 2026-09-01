import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { PrivateRoute } from './routes/PrivateRoute'
import { LoginPage } from './pages/Login/LoginPage'
import { DashboardPage } from './pages/Dashboard/DashboardPage'
import { ProductsPage } from './pages/catalog/ProductsPage'
import { ProductDetailPage } from './pages/catalog/ProductDetailPage'
import { WarehousesPage } from './pages/inventory/WarehousesPage'
import { StockPage } from './pages/inventory/StockPage'
import { CustomersPage } from './pages/sales/CustomersPage'
import { OrdersPage } from './pages/sales/OrdersPage'
import { OrderFormPage } from './pages/sales/OrderFormPage'
import { OrderDetailPage } from './pages/sales/OrderDetailPage'
import { ProductionOrdersPage } from './pages/production/ProductionOrdersPage'
import { ProductionOrderFormPage } from './pages/production/ProductionOrderFormPage'
import { ProductionOrderDetailPage } from './pages/production/ProductionOrderDetailPage'

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
        <Route path="/produtos" element={<ProductsPage />} />
        <Route path="/produtos/:id" element={<ProductDetailPage />} />
        <Route path="/almoxarifados" element={<WarehousesPage />} />
        <Route path="/estoque" element={<StockPage />} />
        <Route path="/clientes" element={<CustomersPage />} />
        <Route path="/pedidos" element={<OrdersPage />} />
        <Route path="/pedidos/novo" element={<OrderFormPage />} />
        <Route path="/pedidos/:id" element={<OrderDetailPage />} />
        <Route path="/pedidos/:id/editar" element={<OrderFormPage />} />
        <Route path="/producao" element={<ProductionOrdersPage />} />
        <Route path="/producao/nova" element={<ProductionOrderFormPage />} />
        <Route path="/producao/:id" element={<ProductionOrderDetailPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
