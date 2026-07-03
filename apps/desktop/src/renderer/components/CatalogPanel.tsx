import React, { useState } from 'react';
import { TouchButton } from '@rms/ui';
import { formatCurrencyINR } from '@rms/utils';

export const CatalogPanel: React.FC = () => {
  const [activeCatalogTab, setActiveCatalogTab] = useState<'items' | 'categories' | 'modifiers' | 'recipes'>('items');

  // React State for Categories
  const [categories, setCategories] = useState([
    { id: '1', name: 'Starters', code: 'STR', displayOrder: 1, isActive: true },
    { id: '2', name: 'Main Course', code: 'MNC', displayOrder: 2, isActive: true },
    { id: '3', name: 'Beverages', code: 'BEV', displayOrder: 3, isActive: true },
  ]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatCode, setNewCatCode] = useState('');

  // React State for Menu Items
  const [menuItems, setMenuItems] = useState([
    { id: '1', categoryId: '1', name: 'Paneer Butter Masala', sku: 'PBM-001', price: 280, isActive: true, hasVariants: true },
    { id: '2', categoryId: '2', name: 'Dal Makhani', sku: 'DLM-002', price: 220, isActive: true, hasVariants: false },
    { id: '3', categoryId: '3', name: 'Masala Chai', sku: 'MCH-003', price: 40, isActive: true, hasVariants: false },
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemCat, setNewItemCat] = useState('1');

  // React State for Modifiers
  const [modifierGroups, setModifierGroups] = useState([
    { id: '1', name: 'Extra Cheese', minSelect: 0, maxSelect: 1, option: 'Chargeable (₹50)' },
    { id: '2', name: 'Spicy Level', minSelect: 1, maxSelect: 1, option: 'Free (Less/Medium/Extra)' },
  ]);
  const [newGroupName, setNewGroupName] = useState('');

  // React State for Recipes
  const [recipes, setRecipes] = useState([
    { id: '1', itemName: 'Paneer Butter Masala', ingredients: ['Paneer (200g)', 'Butter (30g)', 'Tomato Puree (150ml)'] },
    { id: '2', itemName: 'Dal Makhani', ingredients: ['Black Urad Dal (150g)', 'Butter (40g)', 'Cream (20ml)'] },
  ]);
  const [recipeItem, setRecipeItem] = useState('1');
  const [recipeInstruction, setRecipeInstruction] = useState('');

  const handleAddCategory = () => {
    if (!newCatName || !newCatCode) return;
    setCategories([
      ...categories,
      {
        id: (categories.length + 1).toString(),
        name: newCatName,
        code: newCatCode,
        displayOrder: categories.length + 1,
        isActive: true,
      },
    ]);
    setNewCatName('');
    setNewCatCode('');
  };

  const handleAddItem = () => {
    if (!newItemName || !newItemPrice || !newItemSku) return;
    setMenuItems([
      ...menuItems,
      {
        id: (menuItems.length + 1).toString(),
        categoryId: newItemCat,
        name: newItemName,
        sku: newItemSku,
        price: parseFloat(newItemPrice),
        isActive: true,
        hasVariants: false,
      },
    ]);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemSku('');
  };

  const handleAddModifierGroup = () => {
    if (!newGroupName) return;
    setModifierGroups([
      ...modifierGroups,
      {
        id: (modifierGroups.length + 1).toString(),
        name: newGroupName,
        minSelect: 0,
        maxSelect: 1,
        option: 'Chargeable option',
      },
    ]);
    setNewGroupName('');
  };

  const handleAddRecipe = () => {
    const item = menuItems.find((m) => m.id === recipeItem);
    if (!item) return;
    setRecipes([
      ...recipes,
      {
        id: (recipes.length + 1).toString(),
        itemName: item.name,
        ingredients: [recipeInstruction || 'Standard raw materials list'],
      },
    ]);
    setRecipeInstruction('');
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', color: '#1E293B', backgroundColor: '#F8FAFC', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', fontWeight: 'bold', marginBottom: '24px' }}>
        Product Catalog & Menu Setup
      </h1>

      {/* Catalog Sub-Tabs Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', flexWrap: 'wrap' }}>
        {(['items', 'categories', 'modifiers', 'recipes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveCatalogTab(tab)}
            style={{
              padding: '10px 20px',
              backgroundColor: activeCatalogTab === tab ? '#3B82F6' : 'transparent',
              color: activeCatalogTab === tab ? '#FFFFFF' : '#475569',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              minHeight: '44px',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'items' ? 'Menu Items' : tab}
          </button>
        ))}
      </div>

      {/* Menu Items Tab */}
      {activeCatalogTab === 'items' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 'bold' }}>Product Inventory List</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '12px' }}>Item Name</th>
                <th style={{ padding: '12px' }}>SKU Code</th>
                <th style={{ padding: '12px' }}>Category</th>
                <th style={{ padding: '12px' }}>Base Price</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item) => {
                const cat = categories.find((c) => c.id === item.categoryId);
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.name}</td>
                    <td style={{ padding: '12px' }}>{item.sku}</td>
                    <td style={{ padding: '12px' }}>{cat ? cat.name : 'Unassigned'}</td>
                    <td style={{ padding: '12px' }}>{formatCurrencyINR(item.price)}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Register Product Item</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Product Name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minWidth: '200px', minHeight: '44px' }}
              />
              <input
                type="text"
                placeholder="SKU Code"
                value={newItemSku}
                onChange={(e) => setNewItemSku(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minWidth: '120px', minHeight: '44px' }}
              />
              <input
                type="number"
                placeholder="Base Price (₹)"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minWidth: '100px', minHeight: '44px' }}
              />
              <select
                value={newItemCat}
                onChange={(e) => setNewItemCat(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minWidth: '150px', minHeight: '44px' }}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <TouchButton label="Add Item" onPress={handleAddItem} />
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeCatalogTab === 'categories' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 'bold' }}>Nestable Menu Categories</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Category Code</th>
                <th style={{ padding: '12px' }}>Sort Order</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{cat.name}</td>
                  <td style={{ padding: '12px' }}>{cat.code}</td>
                  <td style={{ padding: '12px' }}>{cat.displayOrder}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Add Category Node</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Category Name"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minWidth: '200px', minHeight: '44px' }}
              />
              <input
                type="text"
                placeholder="Internal Code"
                value={newCatCode}
                onChange={(e) => setNewCatCode(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minWidth: '150px', minHeight: '44px' }}
              />
              <TouchButton label="Add Category" onPress={handleAddCategory} />
            </div>
          </div>
        </div>
      )}

      {/* Modifiers Tab */}
      {activeCatalogTab === 'modifiers' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 'bold' }}>Active Modifier Groups</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '12px' }}>Modifier Group</th>
                <th style={{ padding: '12px' }}>Limits</th>
                <th style={{ padding: '12px' }}>Default Option</th>
              </tr>
            </thead>
            <tbody>
              {modifierGroups.map((g) => (
                <tr key={g.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{g.name}</td>
                  <td style={{ padding: '12px' }}>Min: {g.minSelect} / Max: {g.maxSelect}</td>
                  <td style={{ padding: '12px' }}>{g.option}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Create Modifier Group</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Group Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minWidth: '200px', minHeight: '44px' }}
              />
              <TouchButton label="Create Group" onPress={handleAddModifierGroup} />
            </div>
          </div>
        </div>
      )}

      {/* Recipe Editor Tab */}
      {activeCatalogTab === 'recipes' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 'bold' }}>Recipe Raw Materials Mappings</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '12px' }}>Menu Item</th>
                <th style={{ padding: '12px' }}>Active Ingredient Specifications</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{r.itemName}</td>
                  <td style={{ padding: '12px' }}>{r.ingredients.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Configure Item Recipe</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <select
                  value={recipeItem}
                  onChange={(e) => setRecipeItem(e.target.value)}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minWidth: '200px', minHeight: '44px' }}
                >
                  {menuItems.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Ingredients: e.g. Paneer (150g), Butter (20g)"
                  value={recipeInstruction}
                  onChange={(e) => setRecipeInstruction(e.target.value)}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minWidth: '400px', minHeight: '44px' }}
                />
              </div>
              <div>
                <TouchButton label="Save Recipe" onPress={handleAddRecipe} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogPanel;
