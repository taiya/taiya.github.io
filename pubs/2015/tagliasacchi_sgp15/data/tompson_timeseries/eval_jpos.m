clc, clear, close all;
M_gt = load('jpos_gtruth.txt');
M_ht = load('jpos_htrack.txt');
M_to = load('jpos_tompson.txt');

% for some reason first column is empty
% M_gt = M_gt(:,4:end);
% M_ht = M_ht(:,4:end);
% M_to = M_to(:,4:end);

num_frames = size(M_gt,1);
num_joints = size(M_gt,2)/3;

figure(1); hold on;

% e_ht = zeros(num_frames,1);
% e_to = zeros(num_frames,1);
% 
% for i=1:num_frames
%     gt = reshape(M_gt(i,:),3,num_joints);
%     ht = reshape(M_ht(i,:),3,num_joints);
%     to = reshape(M_to(i,:),3,num_joints);
%     
%     % subsample indexes (8 thumb)
% %     gt = gt(:,[12 16 20 24]);
% %     ht = ht(:,[12 16 20 24]);
% %     to = to(:,[12 16 20 24]);
%     
%     % there is a bias in the tompson ground truth. 
%     % points always appear to be shifted. That's why
%     % we correct it here.
%     [~, ht, ~] = procrustes(gt,ht);
%         
%     e_ht(i) = mean( sqrt( sum( (ht-gt).^2, 1 ) ) );
%     e_to(i) = mean( sqrt( sum( (to-gt).^2, 1 ) ) );
% 
%     if false
%         cla;
%         myplot3(gt','.k', 'markersize',10);
%         myplot3(ht','.r', 'markersize',10);
%         myplot3(to','.b', 'markersize',10); 
%         view(-180,-90);
%         continue;
%         % break
%     end
% end
% 
% hold on
% plot(e_to,'b')
% plot(e_ht,'r')
% % ylim([0,30])
% 
% set(gcf,'paperunits','inches')
% size = 2*[5.5,0.5];
% set(gcf,'papersize',size)
% set(gcf,'paperposition',[0.0,0.0,size(1), size(2)])
% % set(gca, 'XTick', []);
% % set(gca, 'YTick', []);
% print -dpdf residuals.pdf
% !open residuals.pdf
% mean(e_to)
% mean(e_ht)

% %---- NOW EVALUATE THE JITTERINESS OF THE SOLUTION
% l_ht = zeros(num_frames,1);
% l_to = zeros(num_frames,1);
% l_gt = zeros(num_frames,1);
% for i=2:num_frames-1
%     gt0 = reshape(M_gt(i-1,:),3,num_joints);
%     ht0 = reshape(M_ht(i-1,:),3,num_joints);
%     to0 = reshape(M_to(i-1,:),3,num_joints);
%     gt1 = reshape(M_gt(i,:),3,num_joints);
%     ht1 = reshape(M_ht(i,:),3,num_joints);
%     to1 = reshape(M_to(i,:),3,num_joints);
%     gt2 = reshape(M_gt(i+1,:),3,num_joints);
%     ht2 = reshape(M_ht(i+1,:),3,num_joints);
%     to2 = reshape(M_to(i+1,:),3,num_joints);    
%     
%     lgt =gt0 -2*gt1 + gt2;
%     lht =ht0 -2*ht1 + ht2;
%     lto =to0 -2*to1 + to2;
%     l_gt(i) = mean( sqrt( sum( lgt.^2, 1 ) ) );
%     l_ht(i) = mean( sqrt( sum( lht.^2, 1 ) ) );
%     l_to(i) = mean( sqrt( sum( lto.^2, 1 ) ) );
% end
% figure(2); hold on
% plot(l_gt,'-k');
% plot(l_ht,'-r');
% plot(l_to,'-b');