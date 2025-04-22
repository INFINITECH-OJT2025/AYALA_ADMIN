"use client";

import { useEffect, useState } from "react"; // ✅ Import useState
import {
  fetchProperties,
  deleteProperty,
  updatePropertyStatus,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  FileText,
  ChevronLeft,
  ChevronRight,
  Banknote,
  Download,
  LayoutGrid,
  User,
  Tag,
  Building2,
  Badge,
  BadgeCheck,
  Clock,
  BadgeX,
} from "lucide-react";
import { List, Hourglass } from "lucide-react";
import {
  MapPin,
  Mail,
  Phone,
  Home,
  DollarSign,
  Ruler,
  Layers,
  ParkingCircle,
  Shield,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CreateListingDialog from "@/components/common/CreateListing"; // Adjust the path if needed
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
interface Property {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  type_of_listing: string;
  property_name: string;
  unit_type: string;
  unit_status: string;
  location: string;
  price: string;
  status: string;
  square_meter: number;
  floor_number: number;
  parking: boolean;
  description: string;
  other_details: string[];
  pool_area: boolean;
  guest_suite: boolean;
  underground_parking: boolean;
  pet_friendly_facilities: boolean;
  balcony_terrace: boolean;
  club_house: boolean;
  gym_fitness_center: boolean;
  elevator: boolean;
  concierge_services: boolean;
  security: boolean;
  property_image: string[];
}

export default function PropertyList() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingStatus, setLoadingStatus] = useState<{
    [key: number]: { approve?: boolean; reject?: boolean };
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [loading, setLoading] = useState(true);
  // Filtering logic
  const filteredProperties = properties.filter((property) => {
    const matchesFilter =
      filter === "all" || property.status.toLowerCase() === filter;
    const matchesSearch =
      property.property_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProperties.length / rowsPerPage);
  const currentProperties = filteredProperties.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await fetchProperties();
        setProperties((prev) => {
          const hasNewData = JSON.stringify(prev) !== JSON.stringify(data);
          return hasNewData ? data : prev; // ✅ Update only if new data is different
        });
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();

    const interval = setInterval(() => {
      loadProperties();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const confirmDelete = (id: number) => {
    setSelectedPropertyId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedPropertyId) return;

    try {
      await deleteProperty(selectedPropertyId);
      setProperties((prev) =>
        prev.filter((prop) => prop.id !== selectedPropertyId)
      );

      // ✅ Show Sonner toast on successful deletion
      toast.success("Property Deleted", {
        description: "The property has been removed successfully.",
      });
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Failed to delete property", {
        description: "Please try again.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedPropertyId(null);
    }
  };

  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setModalOpen(true);
  };

  const handleAction = async (
    propertyId: number,
    action: "approve" | "reject"
  ) => {
    if (action === "reject") {
      setSelectedPropertyId(propertyId);
      setIsRejectDialogOpen(true); // ✅ Open rejection dialog
      return;
    }

    await processAction(propertyId, action, "");
  };

  const processAction = async (
    propertyId: number,
    action: "approve" | "reject",
    reason: string
  ) => {
    setLoadingStatus((prev) => ({
      ...prev,
      [propertyId]: { ...prev[propertyId], [action]: true },
    }));

    try {
      await updatePropertyStatus(
        propertyId,
        action === "approve" ? "approved" : "rejected",
        reason
      );

      setProperties((prev) =>
        prev.map((prop) =>
          prop.id === propertyId
            ? {
                ...prop,
                status: action === "approve" ? "approved" : "rejected",
              }
            : prop
        )
      );

      // ✅ If selectedProperty is being viewed, update its status in real-time
      if (selectedProperty && selectedProperty.id === propertyId) {
        setSelectedProperty((prev) =>
          prev
            ? {
                ...prev,
                status: action === "approve" ? "approved" : "rejected",
              }
            : null
        );
      }

      // ✅ Show Sonner toast notification
      if (action === "approve") {
        toast.success("Property Approved", {
          description: "The property has been successfully approved.",
        });
      } else {
        toast.error("Property Rejected", {
          description: `The property was rejected for the following reason: ${reason}`,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Action Failed", {
        description: "An error occurred while updating the property status.",
      });
    } finally {
      setLoadingStatus((prev) => ({
        ...prev,
        [propertyId]: { ...prev[propertyId], [action]: false },
      }));
    }
  };

  // ✅ Handle rejection dialog submission
  const confirmRejection = () => {
    if (!selectedPropertyId || !rejectionReason.trim()) return;

    processAction(selectedPropertyId, "reject", rejectionReason);
    setIsRejectDialogOpen(false);
    setRejectionReason("");
  };

  const exportToPDF = (properties: Property[]) => {
    const doc = new jsPDF(); // Portrait mode

    // Header
    const addHeader = () => {
      doc.setFontSize(12);
      doc.text("Property List - Export", 14, 10); // Title
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 160, 10); // Date
      doc.setLineWidth(0.5);
      doc.line(14, 15, 200, 15); // Horizontal line below header
    };

    // Footer
    // const addFooter = (pageNumber: number) => {
    //   const pageCount = doc.internal.getNumberOfPages();
    //   doc.setFontSize(10);
    //   doc.text(
    //     `Page ${pageNumber} of ${pageCount}`,
    //     14,
    //     doc.internal.pageSize.height - 10
    //   ); // Page number
    //   doc.text("AyalaLand", 160, doc.internal.pageSize.height - 10); // Footer text
    // };

    properties.forEach((property, index) => {
      if (index > 0) doc.addPage(); // New page for each property

      addHeader(); // Add header on each page

      doc.setFontSize(14); // Slightly smaller font for ID
      doc.text(`Property #${property.id}`, 14, 20); // ID as heading

      doc.setFontSize(10); // Smaller font for property details
      doc.text("Property Details", 14, 30);

      const details = [
        ["Property Name", property.property_name],
        ["Owner Name", `${property.first_name} ${property.last_name}`],
        ["Email", property.email],
        ["Phone", property.phone_number],
        ["Type of Listing", property.type_of_listing],
        ["Unit Type", property.unit_type],
        ["Unit Status", property.unit_status],
        ["Price", property.price],
        ["Square Meter", property.square_meter.toString()],
        ["Floor Number", property.floor_number.toString()],
        ["Parking", property.parking ? "Yes" : "No"],
        ["Location", property.location],
        ["Status", property.status],
        ["Pool Area", property.pool_area ? "Yes" : "No"],
        ["Guest Suite", property.guest_suite ? "Yes" : "No"],
        ["Underground Parking", property.underground_parking ? "Yes" : "No"],
        ["Pet Friendly", property.pet_friendly_facilities ? "Yes" : "No"],
        ["Balcony", property.balcony_terrace ? "Yes" : "No"],
        ["Club House", property.club_house ? "Yes" : "No"],
        ["Gym", property.gym_fitness_center ? "Yes" : "No"],
        ["Elevator", property.elevator ? "Yes" : "No"],
        ["Concierge Services", property.concierge_services ? "Yes" : "No"],
        ["Security", property.security ? "Yes" : "No"],
      ];

      details.forEach((detail, i) => {
        doc.text(`${detail[0]}:`, 14, 40 + i * 8);
        doc.text(detail[1], 80, 40 + i * 8);
      });

      // addFooter(doc.internal.getNumberOfPages()); // Add footer on each page
    });

    doc.save("property_details.pdf");
  };

  return (
    <div className="container">
      <h2 className="text-2xl font-bold mb-4">Property Listings</h2>

      <CreateListingDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />

      <Tabs defaultValue="list">
        <div className="flex flex-col md:flex-row justify-between items-center mb-2 gap-3">
          <div className="flex flex-wrap gap-3">
            {/* Create Listing Button */}
            <Button variant="success" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-5 h-5" />
              Create Listing
            </Button>
            {/* Filter Buttons */}
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              <List className="w-5 h-5 mr-2" />
              All Listings
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              onClick={() => setFilter("pending")}
            >
              <Hourglass className="w-5 h-5 mr-2" />
              Pending
            </Button>
            <Button
              variant={filter === "approved" ? "default" : "outline"}
              onClick={() => setFilter("approved")}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Approved
            </Button>
            <Button
              variant={filter === "rejected" ? "default" : "outline"}
              onClick={() => setFilter("rejected")}
            >
              <XCircle className="w-5 h-5 mr-2" />
              Rejected
            </Button>
          </div>
          <div className="flex justify-between gap-2">
            <Input
              type="text"
              placeholder="Search by property name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Button onClick={() => exportToPDF(properties)} variant="default">
              <Download />
              Export to PDF
            </Button>
          </div>
        </div>
        <TabsList>
          <TabsTrigger value="list">
            {" "}
            <List className="w-5 h-5" />{" "}
          </TabsTrigger>
          <TabsTrigger value="grid">
            {" "}
            <LayoutGrid className="w-5 h-5" />{" "}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          {/* Property Table */}
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : (
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>No.</TableHead>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Type of Listing</TableHead>
                    <TableHead>Property Name</TableHead>
                    <TableHead>Unit Type</TableHead>
                    <TableHead>Unit Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProperties.length > 0 ? (
                    currentProperties.slice().map((property, index) => (
                      <TableRow key={property.id}>
                        <TableCell className="whitespace-nowrap px-2">
                          {index + 1}
                        </TableCell>
                        <TableCell className="whitespace-nowrap px-2">
                          {property.first_name}
                        </TableCell>
                        <TableCell className="whitespace-nowrap px-2">
                          {property.last_name}
                        </TableCell>
                        <TableCell>{property.type_of_listing}</TableCell>
                        <TableCell>{property.property_name}</TableCell>
                        <TableCell>{property.unit_type}</TableCell>
                        <TableCell>{property.unit_status}</TableCell>
                        <TableCell>{property.location}</TableCell>
                        <TableCell>
                          ₱
                          {parseFloat(property.price).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>{property.status}</TableCell>
                        <TableCell className="whitespace-nowrap px-2">
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => handleViewProperty(property)}
                          >
                            <Eye className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => confirmDelete(property.id)}
                            className="ml-2"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={11}
                        className="text-center text-gray-500"
                      >
                        No properties found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </TabsContent>

        <TabsContent value="grid">
          <CardContent>
            {loading ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr>
                      {[...Array(7)].map((_, i) => (
                        <th key={i} className="px-6 py-3">
                          <Skeleton className="h-4 w-24" />
                        </th>
                      ))}
                      <th className="px-6 py-3">
                        <Skeleton className="h-4 w-16" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[...Array(6)].map((_, rowIndex) => (
                      <tr key={rowIndex} className="bg-white dark:bg-[#18181a]">
                        {[...Array(7)].map((_, colIndex) => (
                          <td key={colIndex} className="px-6 py-4">
                            <Skeleton className="h-4 w-full" />
                          </td>
                        ))}
                        <td className="px-6 py-4 flex gap-2">
                          <Skeleton className="h-9 w-9 rounded-md" />
                          <Skeleton className="h-9 w-9 rounded-md" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : currentProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentProperties.map((property, index) => (
                  <div
                    key={property.id}
                    className="flex flex-col justify-between h-full border rounded-xl p-4 shadow bg-white dark:bg-[#27272a]"
                  >
                    <div className="space-y-2 text-sm">
                      <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                        <Home className="w-5 h-5" /> {index + 1}.{" "}
                        {property.property_name}
                      </h3>

                      <p className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {property.first_name} {property.last_name}
                      </p>

                      <p className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        {property.type_of_listing}
                      </p>

                      <p className="flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        {property.unit_type}
                      </p>

                      <p className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {property.unit_status}
                      </p>

                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {property.location}
                      </p>

                      <p className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />₱
                        {parseFloat(property.price).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>

                      <p className="flex items-center gap-2">
                        <span
                          key={property.status}
                          className={`px-3 py-1 rounded-md text-sm font-medium capitalize transition-all duration-300 ${
                            property.status === "pending"
                              ? "bg-yellow-200 dark:bg-yellow-600 text-yellow-800 dark:text-yellow-200"
                              : property.status === "approved"
                              ? "bg-emerald-200 dark:bg-emerald-600 text-emerald-800 dark:text-emerald-200"
                              : "bg-red-200 dark:bg-red-600 text-red-800 dark:text-red-200"
                          }`}
                        >
                          {property.status}
                        </span>
                      </p>
                    </div>

                    {/* Actions fixed at the bottom */}
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => handleViewProperty(property)}
                      >
                        <Eye className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => confirmDelete(property.id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">
                No properties found.
              </p>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#18181a]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <p>
              Are you sure you want to delete this property? This action cannot
              be undone.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 p-4 gap-3">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </Button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}
      {/* Dialog for Viewing Property */}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-6xl h-[90vh] overflow-auto p-6 rounded-lg shadow-lg bg-white dark:bg-[#18181a]">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-white">
              <Home className="w-6 h-6 text-primary" />
              {selectedProperty?.property_name}
              <span
                key={selectedProperty?.status} // ✅ Forces re-render when status changes
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${
                  selectedProperty?.status === "pending"
                    ? "bg-yellow-200 dark:bg-yellow-600 text-yellow-800 dark:text-yellow-200"
                    : selectedProperty?.status === "approved"
                    ? "bg-emerald-200 dark:bg-emerald-600 text-emerald-800 dark:text-emerald-200"
                    : "bg-red-200 dark:bg-red-600 text-red-800 dark:text-red-200"
                }`}
              >
                {selectedProperty?.status}
              </span>
            </DialogTitle>
          </DialogHeader>

          {selectedProperty && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4 bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
                <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <strong>First Name:</strong> {selectedProperty.first_name}
                </p>
                <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <strong>Last Name:</strong> {selectedProperty.last_name}
                </p>
                <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <strong>Email:</strong> {selectedProperty.email}
                </p>
                <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <strong>Phone:</strong> {selectedProperty.phone_number}
                </p>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <strong>Location:</strong> {selectedProperty.location}
                </p>
                <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Banknote className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <strong>Price:</strong> ₱
                  {Number(selectedProperty.price).toLocaleString("en-PH")}
                </p>
                <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Ruler className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <strong>Square Meter:</strong> {selectedProperty.square_meter}{" "}
                  sqm
                </p>
                <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Layers className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <strong>Floor Number:</strong> {selectedProperty.floor_number}
                </p>
                <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <ParkingCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <strong>Parking:</strong>{" "}
                  {selectedProperty.parking ? "Yes" : "No"}
                </p>
                <p className="flex items-start gap-2 col-span-2 text-gray-700 dark:text-gray-300">
                  <strong>Description:</strong>{" "}
                  {selectedProperty.description || "No description provided"}
                </p>
                <p className="text-gray-700 dark:text-gray-300 col-span-2">
                  <strong>Other Details:</strong>
                </p>
                <ul className="text-gray-700 dark:text-gray-300 col-span-2 list-disc pl-5">
                  {selectedProperty.other_details?.length ? (
                    selectedProperty.other_details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))
                  ) : (
                    <li>No details provided</li>
                  )}
                </ul>
              </div>

              {/* Amenities */}
              <div>
                <p className="font-semibold text-gray-800 dark:text-white mb-2">
                  Amenities:
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    {
                      label: "Security",
                      value: selectedProperty.security,
                      icon: "🛡️",
                    },
                    {
                      label: "Pool Area",
                      value: selectedProperty.pool_area,
                      icon: "🏊",
                    },
                    {
                      label: "Guest Suite",
                      value: selectedProperty.guest_suite,
                      icon: "🏢",
                    },
                    {
                      label: "Underground Parking",
                      value: selectedProperty.underground_parking,
                      icon: "🚗",
                    },
                    {
                      label: "Pet-Friendly",
                      value: selectedProperty.pet_friendly_facilities,
                      icon: "🐶",
                    },
                    {
                      label: "Balcony/Terrace",
                      value: selectedProperty.balcony_terrace,
                      icon: "🌿",
                    },
                    {
                      label: "Club House",
                      value: selectedProperty.club_house,
                      icon: "🏡",
                    },
                    {
                      label: "Gym",
                      value: selectedProperty.gym_fitness_center,
                      icon: "🏋",
                    },
                    {
                      label: "Elevator",
                      value: selectedProperty.elevator,
                      icon: "🚀",
                    },
                    {
                      label: "Concierge Services",
                      value: selectedProperty.concierge_services,
                      icon: "🛎️",
                    },
                  ].map(
                    (feature, index) =>
                      feature.value && (
                        <p
                          key={index}
                          className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                        >
                          {feature.icon} {feature.label}:
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </p>
                      )
                  )}
                </div>
              </div>

              {/* Property Images */}
              {selectedProperty.property_image &&
              selectedProperty.property_image.length > 0 ? (
                <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedProperty.property_image.map(
                    (image: string, index: number) => (
                      <div key={index} className="w-full">
                        <img
                          src={image}
                          alt={`Property ${index + 1}`}
                          className="w-full h-60 object-cover rounded-lg shadow-md border border-gray-300 dark:border-gray-700"
                        />
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="w-full h-60 flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-lg">
                  <ImageIcon className="w-12 h-12 text-gray-500 dark:text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-300">
                    No Images Available
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <Button
                  onClick={() => handleAction(selectedProperty.id, "approve")}
                  disabled={
                    selectedProperty.status === "approved" ||
                    loadingStatus[selectedProperty.id]?.approve
                  }
                  className={`bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded ${
                    selectedProperty.status === "approved"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {loadingStatus[selectedProperty.id]?.approve
                    ? "Approving..."
                    : "Approve"}
                </Button>

                <Button
                  onClick={() => handleAction(selectedProperty.id, "reject")}
                  disabled={
                    selectedProperty.status === "rejected" ||
                    loadingStatus[selectedProperty.id]?.reject
                  }
                  className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded ${
                    selectedProperty.status === "rejected"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {loadingStatus[selectedProperty.id]?.reject
                    ? "Rejecting..."
                    : "Reject"}
                </Button>
              </div>
              <Dialog
                open={isRejectDialogOpen}
                onOpenChange={setIsRejectDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Property</DialogTitle>
                    <p>Please provide a reason for rejecting this property.</p>
                  </DialogHeader>

                  <Textarea
                    placeholder="Enter rejection reason..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />

                  <DialogFooter>
                    <Button
                      onClick={() => setIsRejectDialogOpen(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={confirmRejection}
                      disabled={!rejectionReason.trim()}
                      className="bg-red-600 text-white"
                    >
                      Confirm Rejection
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
