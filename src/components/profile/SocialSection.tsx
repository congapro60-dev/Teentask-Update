import React from 'react';
import { UserPlus, Users, Check, X, Heart, User, Clock, Plus } from 'lucide-react';
import { FriendRequest, Relationship, UserProfile } from '../../types';
import { useFirebase } from '../FirebaseProvider';

interface SocialSectionProps {
  friendRequests: FriendRequest[];
  acceptFriendRequest: (id: string) => Promise<void>;
  rejectFriendRequest: (id: string) => Promise<void>;
  relationshipRequests: Relationship[];
  acceptRelationship: (id: string) => Promise<void>;
  rejectRelationship: (id: string) => Promise<void>;
  relationships: Relationship[];
  friends: UserProfile[];
  setSelectedFriend: (friend: UserProfile | null) => void;
  setIsRelationshipModalOpen: (open: boolean) => void;
}

export default function SocialSection({
  friendRequests, acceptFriendRequest, rejectFriendRequest,
  relationshipRequests, acceptRelationship, rejectRelationship,
  relationships, friends, setSelectedFriend, setIsRelationshipModalOpen
}: SocialSectionProps) {
  const { t } = useFirebase();

  return (
    <div className="space-y-6">
      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            <UserPlus size={18} className="text-indigo-600" />
            {t('friendRequests')} ({friendRequests.length})
          </h3>
          <div className="space-y-3">
            {friendRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white overflow-hidden border border-gray-100">
                    {req.fromPhoto ? (
                      <img src={req.fromPhoto} alt={req.fromName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Users size={20} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{req.fromName}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{req.fromRole}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => acceptFriendRequest(req.id)}
                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    <Check size={16} />
                  </button>
                  <button 
                    onClick={() => rejectFriendRequest(req.id)}
                    className="p-2 bg-white text-gray-400 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relationship Requests */}
      {relationshipRequests.length > 0 && (
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-amber-100 bg-amber-50/30">
          <h3 className="font-bold text-amber-900 flex items-center gap-2 mb-4">
            <Heart size={18} className="text-amber-500" />
            {t('relationshipRequests')} ({relationshipRequests.length})
          </h3>
          <div className="space-y-3">
            {relationshipRequests.map(rel => (
              <div key={rel.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-amber-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100">
                    {rel.userPhoto ? (
                      <img src={rel.userPhoto} alt={rel.userName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User size={24} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{rel.userName}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      {t('wantsToConfirmAs')} <span className="text-indigo-600">{rel.title}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => rejectRelationship(rel.id, rel.userId)}
                    className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <X size={18} />
                  </button>
                  <button 
                    onClick={() => acceptRelationship(rel.id, rel.userId)}
                    className="p-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-sm"
                  >
                    <Check size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relationships */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Heart size={18} className="text-red-500" />
          {t('relationships')} ({relationships.filter(r => r.status === 'accepted').length})
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {relationships.filter(r => r.status === 'accepted').length > 0 ? (
            relationships.filter(r => r.status === 'accepted').map(rel => (
              <div key={rel.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 rounded-2xl bg-white overflow-hidden border border-gray-100">
                  {rel.relatedUserPhoto ? (
                    <img src={rel.relatedUserPhoto} alt={rel.relatedUserName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Users size={24} />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{rel.relatedUserName}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      rel.type === 'Family' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {rel.type === 'Family' ? t('family') : t('work')}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">• {rel.title}</span>
                    <span className="text-[10px] text-green-600 font-black uppercase tracking-widest ml-auto">{t('verified')}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-4">
              {relationships.filter(r => r.status === 'pending').length > 0 && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-[10px] text-amber-700 font-bold flex items-center gap-2">
                    <Clock size={12} />
                    {t('youHavePendingRequests')} ({relationships.filter(r => r.status === 'pending').length})
                  </p>
                </div>
              )}
              <p className="text-center text-xs text-gray-400 py-4">{t('noRelationshipsVerified')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Friends List */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Users size={18} className="text-indigo-600" />
          {t('friends')} ({friends.length})
        </h3>
        <div className="space-y-3">
          {friends.length > 0 ? (
            friends.map(friend => (
              <div key={friend.uid} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white overflow-hidden border border-gray-100">
                    {friend.photoURL ? (
                      <img src={friend.photoURL} alt={friend.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Users size={20} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{friend.displayName}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{friend.role}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedFriend(friend);
                    setIsRelationshipModalOpen(true);
                  }}
                  className="p-2 bg-white text-indigo-600 border border-indigo-50 rounded-xl hover:bg-indigo-50 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-xs text-gray-400 py-4">{t('noFriendsYet')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
