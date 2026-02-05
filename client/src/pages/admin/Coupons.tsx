import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, Tag } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const formatCurrency = (value: number) =>
  `R$ ${value.toFixed(2).replace(".", ",")}`;

export default function Coupons() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const couponsQuery = trpc.coupons.list.useQuery();
  const createMutation = trpc.coupons.create.useMutation({
    onSuccess: () => couponsQuery.refetch(),
  });
  const updateMutation = trpc.coupons.update.useMutation({
    onSuccess: () => couponsQuery.refetch(),
  });
  const removeMutation = trpc.coupons.remove.useMutation({
    onSuccess: () => couponsQuery.refetch(),
  });

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrderValue: "",
    maxUses: "",
    validFrom: "",
    validUntil: "",
    isActive: true,
  });

  const coupons = couponsQuery.data ?? [];
  const filteredCoupons = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return coupons;
    return coupons.filter(coupon =>
      coupon.code.toLowerCase().includes(term) ||
      (coupon.description ?? "").toLowerCase().includes(term)
    );
  }, [coupons, searchTerm]);

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minOrderValue: "",
      maxUses: "",
      validFrom: "",
      validUntil: "",
      isActive: true,
    });
    setEditingId(null);
  };

  const openNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEdit = (coupon: typeof coupons[number]) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      description: coupon.description ?? "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrderValue: coupon.minOrderValue ? coupon.minOrderValue.toString() : "",
      maxUses: coupon.maxUses ? coupon.maxUses.toString() : "",
      validFrom: coupon.validFrom ? coupon.validFrom.slice(0, 10) : "",
      validUntil: coupon.validUntil ? coupon.validUntil.slice(0, 10) : "",
      isActive: coupon.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim() || undefined,
      discountType: formData.discountType as "percentage" | "fixed",
      discountValue: Number(formData.discountValue),
      minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : undefined,
      maxUses: formData.maxUses ? Number(formData.maxUses) : undefined,
      validFrom: formData.validFrom || undefined,
      validUntil: formData.validUntil || undefined,
      isActive: formData.isActive,
    };

    if (!payload.code || Number.isNaN(payload.discountValue)) {
      toast.error("Preencha o codigo e o desconto");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...payload,
        });
        toast.success("Cupom atualizado com sucesso!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Cupom criado com sucesso!");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error?.message || "Nao foi possivel salvar o cupom");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja excluir este cupom?")) return;
    try {
      await removeMutation.mutateAsync({ id });
      toast.success("Cupom removido");
    } catch (error: any) {
      toast.error(error?.message || "Nao foi possivel remover");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-cacau">Cupons</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie regras de desconto e campanhas
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gold" onClick={openNew}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cupom
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Cupom" : "Novo Cupom"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Codigo</Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="NUTALLIS10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountType">Tipo de desconto</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, discountType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentual</SelectItem>
                      <SelectItem value="fixed">Fixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountValue">Valor do desconto</Label>
                  <Input
                    id="discountValue"
                    name="discountValue"
                    type="number"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={handleChange}
                    placeholder={formData.discountType === "percentage" ? "10" : "25.00"}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minOrderValue">Pedido minimo (opcional)</Label>
                  <Input
                    id="minOrderValue"
                    name="minOrderValue"
                    type="number"
                    step="0.01"
                    value={formData.minOrderValue}
                    onChange={handleChange}
                    placeholder="150.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Limite de usos (opcional)</Label>
                  <Input
                    id="maxUses"
                    name="maxUses"
                    type="number"
                    value={formData.maxUses}
                    onChange={handleChange}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Valido a partir</Label>
                  <Input
                    id="validFrom"
                    name="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Valido ate</Label>
                  <Input
                    id="validUntil"
                    name="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descricao</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ex: Cupom para primeira compra"
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(value) =>
                    setFormData((prev) => ({ ...prev, isActive: value }))
                  }
                />
                <span className="text-sm text-muted-foreground">Cupom ativo</span>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="btn-gold">
                  {editingId ? "Salvar Alteracoes" : "Criar Cupom"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 font-medium text-cacau">Cupom</th>
                  <th className="text-left p-4 font-medium text-cacau">Desconto</th>
                  <th className="text-left p-4 font-medium text-cacau">Status</th>
                  <th className="text-left p-4 font-medium text-cacau">Validade</th>
                  <th className="text-left p-4 font-medium text-cacau">Usos</th>
                  <th className="text-right p-4 font-medium text-cacau">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-border last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-ouro/10 flex items-center justify-center">
                          <Tag className="h-4 w-4 text-ouro" />
                        </div>
                        <div>
                          <p className="font-medium text-cacau">{coupon.code}</p>
                          <p className="text-sm text-muted-foreground">
                            {coupon.description || "Sem descricao"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-cacau font-medium">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}%`
                          : formatCurrency(coupon.discountValue)}
                      </p>
                      {coupon.minOrderValue ? (
                        <p className="text-sm text-muted-foreground">
                          Min: {formatCurrency(coupon.minOrderValue)}
                        </p>
                      ) : null}
                    </td>
                    <td className="p-4">
                      <Badge
                        className={
                          coupon.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {coupon.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <p className="text-muted-foreground">
                        {coupon.validFrom ? coupon.validFrom.slice(0, 10) : "Livre"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {coupon.validUntil ? coupon.validUntil.slice(0, 10) : "Sem fim"}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-muted-foreground">
                        {coupon.usedCount}/{coupon.maxUses ?? "-"}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(coupon)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(coupon.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCoupons.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum cupom encontrado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
