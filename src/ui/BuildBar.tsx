/**
 * Tower building interface component
 */

import React from 'react';
import { useBuildMode, useGameStore, useMoney } from '../state/store';
import { TOWER_DEFINITIONS } from '../engine/constants';
import type { TowerType } from '../engine/types';

export const BuildBar: React.FC = () => {
  const buildMode = useBuildMode();
  const money = useMoney();
  const enterBuildMode = useGameStore(state => state.enterBuildMode);
  const exitBuildMode = useGameStore(state => state.exitBuildMode);

  const handleTowerSelect = (towerType: TowerType) => {
    if (buildMode === towerType) {
      exitBuildMode();
    } else {
      enterBuildMode(towerType);
    }
  };

  const getTowerCost = (towerType: TowerType) => {
    return TOWER_DEFINITIONS[towerType].baseCost;
  };

  const canAfford = (towerType: TowerType) => {
    return money >= getTowerCost(towerType);
  };

  const getTowerIcon = (towerType: TowerType) => {
    switch (towerType) {
      case 'arrow':
        return '🏹';
      case 'cannon':
        return '💣';
      case 'frost':
        return '❄️';
      default:
        return '🏗️';
    }
  };

  const getTowerStyle = (towerType: TowerType, isSelected: boolean, affordable: boolean) => {
    let borderColor, backgroundColor;
    
    switch (towerType) {
      case 'arrow':
        borderColor = '#10b981';
        backgroundColor = 'rgba(16, 185, 129, 0.2)';
        break;
      case 'cannon':
        borderColor = '#f97316';
        backgroundColor = 'rgba(249, 115, 22, 0.2)';
        break;
      case 'frost':
        borderColor = '#3b82f6';
        backgroundColor = 'rgba(59, 130, 246, 0.2)';
        break;
      default:
        borderColor = '#6b7280';
        backgroundColor = 'rgba(107, 114, 128, 0.2)';
    }

    return {
      border: `2px solid ${borderColor}`,
      backgroundColor: isSelected ? backgroundColor : affordable ? backgroundColor : 'rgba(107, 114, 128, 0.2)',
      opacity: affordable ? 1 : 0.5,
      cursor: affordable ? 'pointer' : 'not-allowed',
      boxShadow: isSelected ? '0 0 0 2px rgba(255, 255, 255, 0.5)' : 'none',
    };
  };

  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'rgba(45, 55, 72, 0.9)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h3 style={{ color: 'white', fontWeight: '600', marginRight: '16px' }}>Build Towers:</h3>
            
            {Object.entries(TOWER_DEFINITIONS).map(([towerType, definition]) => {
              const isSelected = buildMode === towerType;
              const affordable = canAfford(towerType as TowerType);
              const buttonStyle = getTowerStyle(towerType as TowerType, isSelected, affordable);
              
              return (
                <button
                  key={towerType}
                  onClick={() => handleTowerSelect(towerType as TowerType)}
                  disabled={!affordable}
                  style={{
                    ...buttonStyle,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '12px',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    minWidth: '80px',
                  }}
                  aria-label={`Build ${definition.name} for $${definition.baseCost}`}
                >
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>{getTowerIcon(towerType as TowerType)}</div>
                  <div style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>{definition.name}</div>
                  <div style={{ color: affordable ? '#fbbf24' : '#9ca3af', fontSize: '12px' }}>
                    ${definition.baseCost}
                  </div>
                </button>
              );
            })}
            
            {buildMode && (
              <button
                onClick={exitBuildMode}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  marginLeft: '16px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                aria-label="Cancel building"
              >
                Cancel
              </button>
            )}
          </div>
          
          {buildMode && (
            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <p style={{ color: 'white', fontSize: '14px' }}>
                Click on a <span style={{ color: '#4ade80' }}>green tile</span> to place your {TOWER_DEFINITIONS[buildMode].name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
