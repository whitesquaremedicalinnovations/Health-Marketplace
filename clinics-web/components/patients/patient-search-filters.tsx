"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, SlidersHorizontal, FilterX } from "lucide-react";

interface PatientSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  genderFilter: string;
  setGenderFilter: (gender: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  filteredCount: number;
  totalCount: number;
  onCreatePatient: () => void;
  onClearFilters: () => void;
}

export default function PatientSearchFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  genderFilter,
  setGenderFilter,
  sortBy,
  setSortBy,
  filteredCount,
  totalCount,
  onCreatePatient,
  onClearFilters
}: PatientSearchFiltersProps) {
  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Search & Filter Patients
          </CardTitle>
          <Button
            onClick={onCreatePatient}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Gender Filter */}
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <SelectValue placeholder="Filter by gender" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="h-12 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <FilterX className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            Showing {filteredCount} of {totalCount} patients
          </span>
        </div>
      </CardContent>
    </Card>
  );
} 