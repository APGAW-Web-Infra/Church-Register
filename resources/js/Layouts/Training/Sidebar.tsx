// components/Layout/Sidebar.tsx
import React from 'react';
import { X, Trophy, LucideIcon } from 'lucide-react';
import { Button } from '@headlessui/react';

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  navigationItems: NavigationItem[];
  onNavigate: (page: string) => void;
  enrollmentCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentPage,
  navigationItems,
  onNavigate,
  enrollmentCount
}) => {
  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out sidebar ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 bg-red-950/95 dark:bg-red-950 border-r border-red-900`}>

      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-700/20 rounded-lg flex items-center justify-center border border-red-700/30">
            <span className="text-red-200 font-semibold text-sm">CH</span>
          </div>
          <div>
            <span className="font-semibold text-sm text-gray-900 dark:text-white">
              Church Training
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Learning & discipleship
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === item.id
                        ? 'bg-white/5 text-red-200 dark:bg-red-800/60 dark:text-red-100'
                        : 'text-red-300 hover:bg-red-900/40 hover:text-red-100'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Quick Stats */}
      <div className="mt-8 px-4">
        <div className="p-4 rounded-lg bg-white/5 border border-red-800/40">
          <div className="flex items-center space-x-3 mb-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="font-medium text-sm text-red-100">
              Learning Progress
            </span>
          </div>
          <div className="text-2xl font-bold text-red-200">
            {enrollmentCount}
          </div>
          <div className="text-xs text-red-300">
            Courses enrolled
          </div>
        </div>
      </div>
    </div>
  );
};


