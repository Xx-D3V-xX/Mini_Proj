import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, Edit, Trash2, BarChart3, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

interface POI {
  id: string;
  name: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  price_level: number;
  rating: number;
  opening_hours: string;
  tags: string[];
  image_url?: string;
}

interface Analytics {
  totalPOIs: number;
  totalUsers: number;
  totalItineraries: number;
  totalFeedback: number;
  popularPOIs: Array<{ name: string; visits: number }>;
  categoryDistribution: Array<{ category: string; count: number }>;
}

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPOI, setEditingPOI] = useState<POI | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // Fetch POIs
  const { data: pois = [], isLoading: poisLoading } = useQuery<POI[]>({
    queryKey: ["admin-pois"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/pois`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch POIs");
      return res.json();
    },
  });

  // Fetch Analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/analytics/overview`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  // Add POI mutation
  const addPOIMutation = useMutation({
    mutationFn: async (data: Partial<POI>) => {
      const res = await fetch(`${API_BASE}/pois`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add POI");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pois"] });
      toast({ title: "Success", description: "POI added successfully" });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add POI", variant: "destructive" });
    },
  });

  // Update POI mutation
  const updatePOIMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<POI> }) => {
      const res = await fetch(`${API_BASE}/pois/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update POI");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pois"] });
      toast({ title: "Success", description: "POI updated successfully" });
      setEditingPOI(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update POI", variant: "destructive" });
    },
  });

  // Delete POI mutation
  const deletePOIMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/pois/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete POI");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pois"] });
      toast({ title: "Success", description: "POI deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete POI", variant: "destructive" });
    },
  });

  // CSV Import mutation
  const importCSVMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/admin/import`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to import CSV");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pois"] });
      toast({ title: "Success", description: "CSV imported successfully" });
      setCsvFile(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to import CSV", variant: "destructive" });
    },
  });

  const handleSubmitPOI = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      latitude: parseFloat(formData.get("latitude") as string),
      longitude: parseFloat(formData.get("longitude") as string),
      price_level: parseInt(formData.get("price_level") as string),
      rating: parseFloat(formData.get("rating") as string),
      opening_hours: formData.get("opening_hours") as string,
      tags: (formData.get("tags") as string).split(",").map((t) => t.trim()),
      image_url: formData.get("image_url") as string,
    };

    if (editingPOI) {
      updatePOIMutation.mutate({ id: editingPOI.id, data });
    } else {
      addPOIMutation.mutate(data);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage POIs, view analytics, and import data</p>
      </div>

      <Tabs defaultValue="pois" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pois">
            <MapPin className="h-4 w-4 mr-2" />
            POI Management
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="import">
            <Upload className="h-4 w-4 mr-2" />
            CSV Import
          </TabsTrigger>
        </TabsList>

        {/* POI Management Tab */}
        <TabsContent value="pois" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Points of Interest</CardTitle>
                  <CardDescription>Add, edit, or remove tourist attractions</CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add POI
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingPOI ? "Edit POI" : "Add New POI"}</DialogTitle>
                      <DialogDescription>Fill in the details below</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitPOI} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name *</Label>
                          <Input id="name" name="name" defaultValue={editingPOI?.name} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select name="category" defaultValue={editingPOI?.category} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="heritage">Heritage</SelectItem>
                              <SelectItem value="food">Food</SelectItem>
                              <SelectItem value="shopping">Shopping</SelectItem>
                              <SelectItem value="adventure">Adventure</SelectItem>
                              <SelectItem value="relaxation">Relaxation</SelectItem>
                              <SelectItem value="entertainment">Entertainment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea id="description" name="description" defaultValue={editingPOI?.description} required rows={3} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="latitude">Latitude *</Label>
                          <Input id="latitude" name="latitude" type="number" step="any" defaultValue={editingPOI?.latitude} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="longitude">Longitude *</Label>
                          <Input id="longitude" name="longitude" type="number" step="any" defaultValue={editingPOI?.longitude} required />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price_level">Price Level (1-4)</Label>
                          <Input id="price_level" name="price_level" type="number" min="1" max="4" defaultValue={editingPOI?.price_level || 2} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rating">Rating (0-5)</Label>
                          <Input id="rating" name="rating" type="number" step="0.1" min="0" max="5" defaultValue={editingPOI?.rating || 4} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="opening_hours">Opening Hours</Label>
                          <Input id="opening_hours" name="opening_hours" defaultValue={editingPOI?.opening_hours || "9:00-18:00"} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input id="tags" name="tags" defaultValue={editingPOI?.tags?.join(", ")} placeholder="historic, family-friendly, popular" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="image_url">Image URL</Label>
                        <Input id="image_url" name="image_url" defaultValue={editingPOI?.image_url} placeholder="https://..." />
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => { setIsAddDialogOpen(false); setEditingPOI(null); }}>
                          Cancel
                        </Button>
                        <Button type="submit">{editingPOI ? "Update" : "Add"} POI</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {poisLoading ? (
                <div className="text-center py-8">Loading POIs...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Price Level</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pois.map((poi) => (
                      <TableRow key={poi.id}>
                        <TableCell className="font-medium">{poi.name}</TableCell>
                        <TableCell className="capitalize">{poi.category}</TableCell>
                        <TableCell>{poi.rating?.toFixed(1) || "N/A"}</TableCell>
                        <TableCell>{"$".repeat(poi.price_level || 2)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { setEditingPOI(poi); setIsAddDialogOpen(true); }}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deletePOIMutation.mutate(poi.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {analyticsLoading ? (
            <div className="text-center py-8">Loading analytics...</div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total POIs</CardDescription>
                    <CardTitle className="text-4xl">{analytics?.totalPOIs || 0}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Users</CardDescription>
                    <CardTitle className="text-4xl">{analytics?.totalUsers || 0}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Itineraries</CardDescription>
                    <CardTitle className="text-4xl">{analytics?.totalItineraries || 0}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Feedback</CardDescription>
                    <CardTitle className="text-4xl">{analytics?.totalFeedback || 0}</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Popular POIs</CardTitle>
                    <CardDescription>Most visited attractions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics?.popularPOIs?.map((poi, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span>{poi.name}</span>
                          <span className="font-semibold">{poi.visits} visits</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category Distribution</CardTitle>
                    <CardDescription>POIs by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics?.categoryDistribution?.map((cat, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="capitalize">{cat.category}</span>
                          <span className="font-semibold">{cat.count} POIs</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* CSV Import Tab */}
        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CSV Import</CardTitle>
              <CardDescription>Upload a CSV file to bulk import POIs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-file">Select CSV File</Label>
                <Input id="csv-file" type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} />
                <p className="text-sm text-muted-foreground">
                  CSV should include columns: name, category, description, latitude, longitude, price_level, rating, opening_hours, tags
                </p>
              </div>
              <Button onClick={() => csvFile && importCSVMutation.mutate(csvFile)} disabled={!csvFile || importCSVMutation.isPending}>
                <Upload className="h-4 w-4 mr-2" />
                {importCSVMutation.isPending ? "Importing..." : "Import CSV"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
