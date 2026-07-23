"use client";

import { UI } from "@/components/ui";
import { useGetBusinessOrdersQuery } from "@/api/queries/business";
import dayjs from "dayjs";
import { Order } from "@/services";

const STATUS_STYLES: Record<Order["status"], { color: string; bg: string }> = {
  INITIATED: { color: "#DBAD0E", bg: "#F9C6131F" },
  ACCEPTED: { color: "#2282C8", bg: "#2282C81F" },
  ON_GOING: { color: "#3E7DF6", bg: "#3E7DF61F" },
  COMPLETED: { color: "#32BA7C", bg: "#32BA7C1F" },
  CANCELLED: { color: "#FF5244", bg: "#FF52441F" },
};

const TYPE_LABELS: Record<Order["type"], string> = {
  SINGLE: "Single Order",
  BATCH: "Batch Delivery",
  BULK: "Bulk Pickup",
};

export const OrdersTable = ({ businessId }: { businessId: string }) => {
  const { data, isLoading } = useGetBusinessOrdersQuery({ businessId, limit: 10, order: "DESC" });
  const orders = data?.results ?? [];

  return (
    <div>
      <UI.SectionHeader text="RECENT ORDERS" />

      <div>
        <div className="scroll-bar overflow-y-auto max-h-[20rem] overflow-x-auto">
          <UI.Table>
            <UI.TableHeader className="bg-transparent">
              <UI.TableRow>
                <UI.TableHead>No</UI.TableHead>
                <UI.TableHead>Order ID</UI.TableHead>
                <UI.TableHead>Bike Assigned</UI.TableHead>
                <UI.TableHead>Status</UI.TableHead>
                <UI.TableHead>Time & Date</UI.TableHead>
                <UI.TableHead>Order Type</UI.TableHead>
              </UI.TableRow>
            </UI.TableHeader>
            <UI.TableBody>
              {orders.length ? (
                orders.map((order, i) => {
                  const style = STATUS_STYLES[order.status] ?? STATUS_STYLES.INITIATED;
                  return (
                    <UI.TableRow key={order._id}>
                      <UI.TableCell>{i + 1}.</UI.TableCell>
                      <UI.TableCell>#{order.orderNumber}</UI.TableCell>
                      <UI.TableCell>{order.vehicle?.plateNumber ?? "N/A"}</UI.TableCell>
                      <UI.TableCell>
                        <span
                          className="font-faktum-test px-2.5 py-1.5 rounded-full text-nowrap"
                          style={{ color: style.color, backgroundColor: style.bg }}
                        >
                          {order.status}
                        </span>
                      </UI.TableCell>
                      <UI.TableCell>
                        <span>{dayjs(order.createdAt).format("h:mma")}</span> <br />
                        <span>{dayjs(order.createdAt).format("DD/MM/YY")}</span>
                      </UI.TableCell>
                      <UI.TableCell className="text-nowrap">{TYPE_LABELS[order.type] ?? order.type}</UI.TableCell>
                    </UI.TableRow>
                  );
                })
              ) : isLoading ? (
                <UI.TableLoading rowCount={5} columnCount={6} />
              ) : (
                <UI.TableRow>
                  <UI.TableCell colSpan={6} className="h-24 text-center font-faktum-test font-semibold">
                    No orders yet.
                  </UI.TableCell>
                </UI.TableRow>
              )}
            </UI.TableBody>
          </UI.Table>
        </div>
      </div>
    </div>
  );
};
