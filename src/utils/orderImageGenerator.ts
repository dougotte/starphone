type CartItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
};

type OrderData = {
  orderId: string;
  customerName: string;
  customerCpf: string;
  customerPhone: string;
  customerEmail: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  };
  items: CartItem[];
  total: number;
  paymentMethod: 'pix' | 'dinheiro';
  paymentStatus: string;
};

export async function generateOrderImage(orderData: OrderData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 800;

  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let y = 40;

  ctx.fillStyle = '#00ff00';
  ctx.fillRect(0, 0, canvas.width, 80);

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('PEDIDO CONFIRMADO', canvas.width / 2, 50);

  y = 120;

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Pedido #${orderData.orderId.substring(0, 8)}`, 40, y);

  y += 40;
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Dados do Cliente:', 40, y);

  y += 30;
  ctx.font = '16px Arial';
  ctx.fillText(`Nome: ${orderData.customerName}`, 60, y);

  y += 25;
  ctx.fillText(`CPF: ${orderData.customerCpf}`, 60, y);

  y += 25;
  ctx.fillText(`Telefone: ${orderData.customerPhone}`, 60, y);

  y += 25;
  ctx.fillText(`Email: ${orderData.customerEmail}`, 60, y);

  y += 40;
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Endereço de Entrega:', 40, y);

  y += 30;
  ctx.font = '16px Arial';
  const addressLine1 = `${orderData.address.street}, ${orderData.address.number}`;
  ctx.fillText(addressLine1, 60, y);

  if (orderData.address.complement) {
    y += 25;
    ctx.fillText(orderData.address.complement, 60, y);
  }

  y += 25;
  ctx.fillText(orderData.address.neighborhood, 60, y);

  y += 25;
  ctx.fillText(`${orderData.address.city} - ${orderData.address.state}`, 60, y);

  y += 25;
  ctx.fillText(`CEP: ${orderData.address.cep}`, 60, y);

  y += 40;
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Produtos:', 40, y);

  y += 30;
  ctx.font = '16px Arial';
  orderData.items.forEach(item => {
    ctx.fillText(`• ${item.name} (${item.brand})`, 60, y);
    y += 25;
    ctx.fillText(`  Qtd: ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}`, 60, y);
    y += 30;
  });

  y += 20;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, y);
  ctx.lineTo(canvas.width - 40, y);
  ctx.stroke();

  y += 30;
  ctx.font = 'bold 22px Arial';
  ctx.fillText(`TOTAL: R$ ${orderData.total.toFixed(2)}`, 40, y);

  y += 40;
  ctx.font = '16px Arial';
  ctx.fillText(`Forma de Pagamento: ${orderData.paymentMethod === 'pix' ? 'PIX' : 'Dinheiro'}`, 40, y);

  y += 25;
  ctx.fillText(`Status: ${orderData.paymentStatus}`, 40, y);

  y += 60;
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(0, y - 40, canvas.width, 60);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Obrigado pela preferência!', canvas.width / 2, y - 10);

  canvas.height = y + 40;

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/png');
  });
}
