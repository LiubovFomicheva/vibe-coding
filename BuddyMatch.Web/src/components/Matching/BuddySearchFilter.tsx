import React, { useState, useEffect } from 'react';
import { BuddyProfile, Employee } from '../../types';
import './BuddySearchFilter.css';

interface BuddySearchFilterProps {
  buddyProfiles: BuddyProfile[];
  onFilteredResults: (filtered: BuddyProfile[]) => void;
  loading?: boolean;
}

interface FilterOptions {
  location: string[];
  unit: string[];
  techStack: string[];
  interests: string[];
}

const BuddySearchFilter: React.FC<BuddySearchFilterProps> = ({
  buddyProfiles,
  onFilteredResults,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedTechStack, setSelectedTechStack] = useState('');
  const [selectedInterests, setSelectedInterests] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('availability');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    location: [],
    unit: [],
    techStack: [],
    interests: []
  });

  // Extract filter options from buddy profiles
  useEffect(() => {
    if (buddyProfiles.length === 0) return;

    const locations = new Set<string>();
    const units = new Set<string>();
    const techStackItems = new Set<string>();
    const interestItems = new Set<string>();

    buddyProfiles.forEach(profile => {
      // Use effective values (buddy-specific or fallback to employee)
      const effectiveLocation = profile.buddyLocation || profile.employee?.location;
      const effectiveUnit = profile.buddyUnit || profile.employee?.unit;
      const effectiveTechStack = profile.buddyTechStack || profile.employee?.techStack;
      const effectiveInterests = profile.interests || profile.employee?.interests;

      if (effectiveLocation) locations.add(effectiveLocation);
      if (effectiveUnit) units.add(effectiveUnit);
      
      if (effectiveTechStack) {
        effectiveTechStack.split(',').forEach(tech => 
          techStackItems.add(tech.trim())
        );
      }
      
      if (effectiveInterests) {
        effectiveInterests.split(',').forEach(interest => 
          interestItems.add(interest.trim())
        );
      }
    });

    setFilterOptions({
      location: Array.from(locations).sort(),
      unit: Array.from(units).sort(),
      techStack: Array.from(techStackItems).sort(),
      interests: Array.from(interestItems).sort()
    });
  }, [buddyProfiles]);

  // Apply filters
  useEffect(() => {
    let filtered = [...buddyProfiles];

    // Search by name or title
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(profile => 
        profile.employee?.firstName?.toLowerCase().includes(term) ||
        profile.employee?.lastName?.toLowerCase().includes(term) ||
        profile.employee?.title?.toLowerCase().includes(term) ||
        profile.bio?.toLowerCase().includes(term) ||
        profile.specialties?.toLowerCase().includes(term)
      );
    }

    // Filter by location
    if (selectedLocation) {
      filtered = filtered.filter(profile => {
        const effectiveLocation = profile.buddyLocation || profile.employee?.location;
        return effectiveLocation === selectedLocation;
      });
    }

    // Filter by unit
    if (selectedUnit) {
      filtered = filtered.filter(profile => {
        const effectiveUnit = profile.buddyUnit || profile.employee?.unit;
        return effectiveUnit === selectedUnit;
      });
    }

    // Filter by tech stack
    if (selectedTechStack) {
      filtered = filtered.filter(profile => {
        const effectiveTechStack = profile.buddyTechStack || profile.employee?.techStack;
        return effectiveTechStack?.toLowerCase().includes(selectedTechStack.toLowerCase());
      });
    }

    // Filter by interests
    if (selectedInterests) {
      filtered = filtered.filter(profile => {
        const effectiveInterests = profile.interests || profile.employee?.interests;
        return effectiveInterests?.toLowerCase().includes(selectedInterests.toLowerCase());
      });
    }

    // Filter by availability
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(profile => {
        switch (availabilityFilter) {
          case 'available':
            return profile.canAcceptNewBuddy;
          case 'full':
            return !profile.canAcceptNewBuddy;
          case 'high-capacity':
            return profile.maxActiveBuddies >= 4;
          default:
            return true;
        }
      });
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'availability':
          return b.availabilityScore - a.availabilityScore;
        case 'capacity':
          return (b.maxActiveBuddies - b.currentActiveBuddies) - (a.maxActiveBuddies - a.currentActiveBuddies);
        case 'experience':
          const aExp = a.employee?.startDate ? new Date().getTime() - new Date(a.employee.startDate).getTime() : 0;
          const bExp = b.employee?.startDate ? new Date().getTime() - new Date(b.employee.startDate).getTime() : 0;
          return bExp - aExp;
        case 'name':
          const aName = `${a.employee?.firstName} ${a.employee?.lastName}`;
          const bName = `${b.employee?.firstName} ${b.employee?.lastName}`;
          return aName.localeCompare(bName);
        default:
          return 0;
      }
    });

    onFilteredResults(filtered);
  }, [
    buddyProfiles,
    searchTerm,
    selectedLocation,
    selectedUnit,
    selectedTechStack,
    selectedInterests,
    availabilityFilter,
    sortBy,
    onFilteredResults
  ]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSelectedUnit('');
    setSelectedTechStack('');
    setSelectedInterests('');
    setAvailabilityFilter('all');
    setSortBy('availability');
  };

  const activeFiltersCount = [
    searchTerm,
    selectedLocation,
    selectedUnit,
    selectedTechStack,
    selectedInterests,
    availabilityFilter !== 'all' ? availabilityFilter : ''
  ].filter(Boolean).length;

  return (
    <div className="buddy-search-filter">
      <div className="filter-header">
        <h3>
          <span className="filter-icon">🔍</span>
          Search & Filter Buddy Guides
        </h3>
        <div className="filter-stats">
          {activeFiltersCount > 0 && (
            <span className="active-filters-count">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
            </span>
          )}
          <button 
            className="btn btn-sm btn-secondary"
            onClick={clearFilters}
            disabled={activeFiltersCount === 0}
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="filter-controls">
        {/* Search Bar */}
        <div className="filter-group search-group">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, title, bio, or specialties..."
            className="search-input"
          />
        </div>

        {/* Location Filter */}
        <div className="filter-group">
          <label htmlFor="location">Location</label>
          <select
            id="location"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">All Locations</option>
            {filterOptions.location.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        {/* Unit Filter */}
        <div className="filter-group">
          <label htmlFor="unit">Unit/Team</label>
          <select
            id="unit"
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
          >
            <option value="">All Units</option>
            {filterOptions.unit.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>

        {/* Tech Stack Filter */}
        <div className="filter-group">
          <label htmlFor="techStack">Tech Stack</label>
          <select
            id="techStack"
            value={selectedTechStack}
            onChange={(e) => setSelectedTechStack(e.target.value)}
          >
            <option value="">All Technologies</option>
            {filterOptions.techStack.map(tech => (
              <option key={tech} value={tech}>{tech}</option>
            ))}
          </select>
        </div>

        {/* Interests Filter */}
        <div className="filter-group">
          <label htmlFor="interests">Interests</label>
          <select
            id="interests"
            value={selectedInterests}
            onChange={(e) => setSelectedInterests(e.target.value)}
          >
            <option value="">All Interests</option>
            {filterOptions.interests.map(interest => (
              <option key={interest} value={interest}>{interest}</option>
            ))}
          </select>
        </div>

        {/* Availability Filter */}
        <div className="filter-group">
          <label htmlFor="availability">Availability</label>
          <select
            id="availability"
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
          >
            <option value="all">All Availability</option>
            <option value="available">Available for New Matches</option>
            <option value="full">At Capacity</option>
            <option value="high-capacity">High Capacity (4+ slots)</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="filter-group">
          <label htmlFor="sortBy">Sort By</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="availability">Availability Score</option>
            <option value="capacity">Available Slots</option>
            <option value="experience">Experience (Tenure)</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="filter-loading">
          <div className="spinner-small"></div>
          <span>Applying filters...</span>
        </div>
      )}
    </div>
  );
};

export default BuddySearchFilter;
