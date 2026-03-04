import { useState } from 'react';
import { User, Calendar, Mail, Edit, Package, Clock, TrendingUp, Heart, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import type { Item } from '../types';
import { ItemCard } from './ItemCard';
import { EditProfileModal } from './EditProfileModal';
import { MessageModal } from './MessageModal';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userItems: Item[];
  borrowedItems: Item[];
  favoritedItems: Set<string>;
  allItems: Item[];
  onItemClick: (item: Item) => void;
  onFavorite: (itemId: string) => void;
  onAddItem?: () => void;
  currentUser: any;
  bookingRequests: { incoming: any[]; outgoing: any[] };
  onRequestAction: (id: string, action: string) => void;
}

export function ProfileModal({ isOpen, onClose, userItems, borrowedItems, favoritedItems, allItems, onItemClick, onFavorite, onAddItem, currentUser, bookingRequests, onRequestAction }: ProfileModalProps) {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const favoriteItems = allItems.filter(item => favoritedItems.has(item.id));
  const incoming = bookingRequests?.incoming || [];
  const outgoing = bookingRequests?.outgoing || [];

  // --- 通知數量計算邏輯 ---
  const pendingIncomingCount = incoming.filter((r: any) => r.status === 'pending').length;
  const unreadOutgoingCount = outgoing.filter((r: any) => 
    (r.status === 'approved' || r.status === 'declined') && r.is_read === false
  ).length;
  const notificationCount = pendingIncomingCount + unreadOutgoingCount;

  if (!currentUser) return null;

  // 核心分類邏輯
  const lentOutItems = userItems.filter(item => {
    const hasApprovedReq = incoming.some((r: any) => (r.item_id === item.id || r.items?.id === item.id) && r.status === 'approved');
    return hasApprovedReq || (!item.available && item.borrowedBy && !incoming.some((r: any) => (r.item_id === item.id || r.items?.id === item.id) && (r.status === 'pending' || r.status === 'declined')));
  });

  const availableItems = userItems.filter(item => {
    if (lentOutItems.some(i => i.id === item.id)) return false;
    const hasPendingOrDeclined = incoming.some((r: any) => (r.item_id === item.id || r.items?.id === item.id) && (r.status === 'pending' || r.status === 'declined'));
    if (hasPendingOrDeclined) return true;
    return item.available;
  });

  const offlineItems = userItems.filter(item =>
    !lentOutItems.some(i => i.id === item.id) && !availableItems.some(i => i.id === item.id)
  );

  const handleApprove = (requestId: string) => {
    onRequestAction(requestId, 'approve');
  };

  const handleDecline = (requestId: string) => {
    try {
      onRequestAction(requestId, 'decline');
    } catch (e) {
      //console.log('onRequestAction ERROR:', e);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>個人資料</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback><User className="w-8 h-8" /></AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{currentUser.name}</h3>
                      <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setIsEditProfileOpen(true)}>
                      <Edit className="w-4 h-4 mr-2" />編輯資料
                    </Button>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>加入於 2026年</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{currentUser.email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">快速統計</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="font-semibold">{userItems.length}</div>
                      <div className="text-xs text-muted-foreground">發布物品</div>
                    </div>
                    <div>
                      <div className="font-semibold">{offlineItems.length}</div>
                      <div className="text-xs text-muted-foreground">已下架</div>
                    </div>
                    <div>
                      <div className="font-semibold">{lentOutItems.length}</div>
                      <div className="text-xs text-muted-foreground">借出中</div>
                    </div>
                    <div>
                      <div className="font-semibold">
                        {outgoing.filter((r: any) => r.status === 'approved').length}
                      </div>
                      <div className="text-xs text-muted-foreground">借用中</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">概覽</TabsTrigger>
                  <TabsTrigger value="my-items">我的物品</TabsTrigger>
                  <TabsTrigger value="requests" className="relative">
                    借用請求
                    {notificationCount > 0 && (
                      <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center">
                        {notificationCount}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="favorites">收藏</TabsTrigger>
                </TabsList>

                <div className="mt-4">
                  <TabsContent value="overview">
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-6">
                        <Card>
                          <CardHeader><CardTitle className="text-lg">最近活動</CardTitle></CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {userItems.slice(0, 3).map((item, i) => (
                                <div key={item.id} className="flex items-center space-x-3">
                                  <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-green-500' : i === 1 ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                                  <div className="flex-1">
                                    <p className="text-sm">發布了物品：「{item.title}」</p>
                                    <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString('zh-TW')}</p>
                                  </div>
                                </div>
                              ))}
                              {userItems.length === 0 && <p className="text-sm text-muted-foreground">還沒有任何活動</p>}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader><CardTitle className="text-lg">表現指標</CardTitle></CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                                  <Package className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="font-semibold">{userItems.length}</div>
                                <div className="text-sm text-muted-foreground">分享物品</div>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                                  <Clock className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="font-semibold">100%</div>
                                <div className="text-sm text-muted-foreground">回覆率</div>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
                                  <Star className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="font-semibold">5.0</div>
                                <div className="text-sm text-muted-foreground">平均評分</div>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-2">
                                  <TrendingUp className="w-6 h-6 text-orange-600" />
                                </div>
                                <div className="font-semibold">{incoming.filter((r: any) => r.status === 'approved').length}</div>
                                <div className="text-sm text-muted-foreground">借出次數</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="my-items">
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">我發布的物品 ({userItems.length})</h3>
                          <Button size="sm" onClick={onAddItem}>發布新物品</Button>
                        </div>
                        {userItems.length > 0 && (
                          <div className="grid grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg">
                            <div className="text-center">
                              <div className="font-semibold text-green-600">{availableItems.length}</div>
                              <div className="text-xs text-muted-foreground">可借用</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-orange-600">{lentOutItems.length}</div>
                              <div className="text-xs text-muted-foreground">已借出</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-gray-600">{offlineItems.length}</div>
                              <div className="text-xs text-muted-foreground">下架</div>
                            </div>
                          </div>
                        )}
                        
                        {lentOutItems.length > 0 && (
                          <div>
                            <h4 className="font-medium text-orange-600 mb-3">當前借出中的物品</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {lentOutItems.map(item => {
                                const approvedReq = incoming.find((r: any) => (r.item_id === item.id || r.items?.id === item.id) && r.status === 'approved');
                                const borrowerName = item.borrowedBy?.name || approvedReq?.borrower_name || '借用者';
                                const borrowDate = item.borrowedBy?.borrowedAt || approvedReq?.created_at || new Date().toISOString();
                                const returnDate = item.borrowedBy?.returnDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

                                return (
                                  <Card key={item.id} className="border-orange-200">
                                    <CardContent className="p-4">
                                      <div className="flex items-start space-x-4">
                                        <img src={item.imageUrl} alt={item.title} className="w-16 h-16 object-cover rounded-lg" />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-start justify-between">
                                            <h5 className="font-semibold truncate">{item.title}</h5>
                                            <Badge variant="secondary" className="bg-orange-100 text-orange-700 whitespace-nowrap ml-2">已借出</Badge>
                                          </div>
                                          {(item.borrowedBy || approvedReq) && (
                                            <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                                              <div className="flex items-center space-x-2 mb-2">
                                                <Avatar className="w-6 h-6">
                                                  <AvatarFallback className="text-xs">{borrowerName[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium text-sm truncate">{borrowerName}</span>
                                              </div>
                                              <div className="text-xs text-muted-foreground space-y-1">
                                                <div>借出日：{new Date(borrowDate).toLocaleDateString('zh-TW')}</div>
                                                <div>應歸還：{new Date(returnDate).toLocaleDateString('zh-TW')}</div>
                                              </div>
                                              
                                              {/* 新增的：取消借出與確認歸還按鈕區塊 */}
                                              {approvedReq && (
                                                <div className="flex gap-2 mt-3 pt-3 border-t border-orange-200/60">
                                                  <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="w-full text-xs text-gray-600 border-gray-300 hover:bg-gray-100 px-2"
                                                    onClick={() => onRequestAction(approvedReq.id, 'cancel_borrow')}
                                                  >
                                                    取消借出
                                                  </Button>
                                                  <Button 
                                                    size="sm" 
                                                    className="w-full text-xs bg-orange-600 hover:bg-orange-700 text-white px-2"
                                                    onClick={() => onRequestAction(approvedReq.id, 'confirm_return')}
                                                  >
                                                    確認歸還
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        
                        {offlineItems.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-500 mb-3">已下架的物品</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {offlineItems.map(item => (
                                <ItemCard key={item.id} item={item} onItemClick={onItemClick} onFavorite={onFavorite} isFavorited={favoritedItems.has(item.id)} />
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {availableItems.length > 0 && (
                          <div>
                            <h4 className="font-medium text-green-600 mb-3">可借用的物品</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {availableItems.map(item => (
                                <ItemCard key={item.id} item={item} onItemClick={onItemClick} onFavorite={onFavorite} isFavorited={favoritedItems.has(item.id)} />
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {userItems.length === 0 && (
                          <div className="text-center py-8">
                            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-semibold mb-2">還沒有發布物品</h3>
                            <p className="text-muted-foreground mb-4">開始分享您的物品給鄰居們吧！</p>
                            <Button onClick={onAddItem}>發布第一個物品</Button>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="requests">
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-6 p-1">
                        <div>
                          <h3 className="font-semibold mb-3">收到的借用請求 ({incoming.length})</h3>
                          {incoming.length > 0 ? (
                            <div className="space-y-3">
                              {incoming.map((request: any) => (
                                <div key={request.id} className="border rounded-lg p-4 bg-white">
                                  <div className="flex items-start space-x-4">
                                    {request.items?.image_url && (
                                      <img src={request.items.image_url} alt={request.items?.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <div>
                                          <h4 className="font-semibold">{request.items?.title}</h4>
                                          <div className="flex items-center space-x-2 mt-1">
                                            <Avatar className="w-5 h-5">
                                              <AvatarFallback className="text-xs">{request.borrower_name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm text-muted-foreground">{request.borrower_name}</span>
                                          </div>
                                        </div>
                                        <Badge variant={request.status === 'pending' ? 'secondary' : request.status === 'approved' ? 'default' : 'destructive'}>
                                          {request.status === 'pending' ? '待處理' : request.status === 'approved' ? '已同意' : request.status === 'cancelled' ? '已取消' : request.status === 'completed' ? '已完成' : '已拒絕'}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-2">{request.message}</p>
                                      <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs text-muted-foreground">{new Date(request.created_at).toLocaleDateString('zh-TW')}</span>
                                        <div className="flex space-x-2">
                                          <button
                                            className="text-xs border rounded px-2 py-1 hover:bg-gray-50"
                                            onClick={() => { setSelectedRequest(request); setIsMessageModalOpen(true); }}
                                          >
                                            💬 訊息
                                          </button>
                                          {request.status === 'pending' && (
                                            <>
                                              <button
                                                className="text-xs border rounded px-2 py-1 hover:bg-gray-50"
                                                onClick={() => handleDecline(request.id)}
                                              >
                                                拒絕
                                              </button>
                                              <button
                                                className="text-xs bg-purple-600 text-white rounded px-2 py-1 hover:bg-purple-700"
                                                onClick={() => handleApprove(request.id)}
                                              >
                                                同意
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 bg-muted/30 rounded-lg">
                              <p className="text-muted-foreground text-sm">還沒有收到借用請求</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold mb-3">我發出的請求 ({outgoing.length})</h3>
                          {outgoing.length > 0 ? (
                            <div className="space-y-3">
                              {outgoing.map((request: any) => (
                                <div key={request.id} className="border rounded-lg p-4 bg-white relative">
                                  {/* 紅點提示：如果是尚未讀取的已回覆狀態 */}
                                  {(request.status === 'approved' || request.status === 'declined') && request.is_read === false && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                  )}
                                  <div className="flex items-start space-x-4">
                                    {request.items?.image_url && (
                                      <img src={request.items.image_url} alt={request.items?.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-semibold">{request.items?.title}</h4>
                                        <Badge variant={request.status === 'pending' ? 'secondary' : request.status === 'approved' ? 'default' : 'destructive'}>
                                          {request.status === 'pending' ? '待處理' : request.status === 'approved' ? '已同意' : request.status === 'cancelled' ? '已取消' : request.status === 'completed' ? '已歸還' : '已拒絕'}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-2">{request.message}</p>
                                      <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs text-muted-foreground">{new Date(request.created_at).toLocaleDateString('zh-TW')}</span>
                                        <button
                                          className="text-xs border rounded px-2 py-1 hover:bg-gray-50"
                                          onClick={() => { 
                                            setSelectedRequest(request); 
                                            setIsMessageModalOpen(true);
                                            // 點擊訊息時觸發標記已讀的 API 動作
                                            if (request.is_read === false) {
                                              onRequestAction(request.id, 'mark_read');
                                            }
                                          }}
                                        >
                                          💬 訊息
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 bg-muted/30 rounded-lg">
                              <p className="text-muted-foreground text-sm">還沒有發出借用請求</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="favorites">
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4">
                        <h3 className="font-semibold">我的收藏 ({favoriteItems.length})</h3>
                        {favoriteItems.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {favoriteItems.map(item => (
                              <ItemCard key={item.id} item={item} onItemClick={onItemClick} onFavorite={onFavorite} isFavorited={true} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-semibold mb-2">還沒有收藏物品</h3>
                            <p className="text-muted-foreground">收藏喜歡的物品，方便以後查找。</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        request={selectedRequest}
        currentUser={currentUser}
      />
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentUser}
        onSave={(data) => {
          //console.log('Updated:', data);
          setIsEditProfileOpen(false);
        }}
      />
    </>
  );
}