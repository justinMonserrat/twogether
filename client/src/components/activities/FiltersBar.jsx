// src/components/activities/FiltersBar.jsx
import React from "react";
import "../../styles/Activities.css";

const TAG_OPTIONS = ["creative", "cooking", "romantic", "competitive"];

export default function FiltersBar({ filters, setFilters }) {
  const toggleIndoor = () => {
    setFilters((prev) => ({
      ...prev,
      indoorOnly: !prev.indoorOnly,
      outdoorOnly: false,
    }));
  };

  const toggleOutdoor = () => {
    setFilters((prev) => ({
      ...prev,
      outdoorOnly: !prev.outdoorOnly,
      indoorOnly: false,
    }));
  };

  const updatePrice = (e) => {
    setFilters((prev) => ({
      ...prev,
      price: e.target.value,
    }));
  };

  const toggleTag = (tag) => {
    setFilters((prev) => {
      const tags = new Set(prev.tags || []);
      tags.has(tag) ? tags.delete(tag) : tags.add(tag);
      return { ...prev, tags: Array.from(tags) };
    });
  };

  return (
    <div className="filters-bar">
      <h3>Filters</h3>
      <div className="filters-grid">
        {/* Indoor / Outdoor Toggle */}
        <div className="filter-group">
          <label>
            <input
              type="checkbox"
              checked={filters.indoorOnly || false}
              onChange={toggleIndoor}
            />
            Indoor
          </label>
          <label>
            <input
              type="checkbox"
              checked={filters.outdoorOnly || false}
              onChange={toggleOutdoor}
            />
            Outdoor
          </label>
        </div>

        {/* Price Dropdown */}
        <div className="filter-group">
          <label>Price:</label>
          <select value={filters.price || ""} onChange={updatePrice}>
            <option value="">Any</option>
            <option value="free">Free</option>
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
          </select>
        </div>

        {/* Tags */}
        <div className="filter-group">
          <label>Tags:</label>
          <div className="tag-options">
            {TAG_OPTIONS.map((tag) => (
              <label key={tag}>
                <input
                  type="checkbox"
                  checked={(filters.tags || []).includes(tag)}
                  onChange={() => toggleTag(tag)}
                />
                {tag}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
