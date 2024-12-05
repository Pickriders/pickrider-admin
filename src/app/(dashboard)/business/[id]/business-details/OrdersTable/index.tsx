import { UI } from "@/components/ui";

export const OrdersTable = () => {
  return (
    <div>
      <div className="flex items-center gap-x-4">
        <h4 className="text-primary-gray  font-semibold text-xs">ORDERS</h4>{" "}
        <span className="w-full flex-1 h-[1px] bg-gray-200 dark:bg-gray-100/20" />
      </div>

      <div>
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
        </UI.Table>
        <div className="scroll-bar overflow-y-auto h-[15rem]">
          <UI.Table>
            <UI.TableBody>
              {Array(10)
                .fill(0)
                .map((_, i) => {
                  return (
                    <UI.TableRow key={i}>
                      <UI.TableCell>1.</UI.TableCell>
                      <UI.TableCell>#43650</UI.TableCell>
                      <UI.TableCell>ENU-225-AE</UI.TableCell>
                      <UI.TableCell>
                        <span className="text-[#DBAD0E] font-faktum-test px-2.5 py-1.5 bg-[#F9C6131F] rounded-full">
                          Processing
                        </span>
                      </UI.TableCell>
                      <UI.TableCell>
                        <span>9:42pm</span> <br />
                        <span>12/04/23</span>
                      </UI.TableCell>
                      <UI.TableCell>Pickup Order</UI.TableCell>
                    </UI.TableRow>
                  );
                })}
            </UI.TableBody>
          </UI.Table>
        </div>
      </div>
      <div className="flex justify-end mt-5">
        <UI.PaginationBtns totalPages={4} currentPage={1} />
      </div>
    </div>
  );
};
