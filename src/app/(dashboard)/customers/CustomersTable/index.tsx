import { UI } from "@/components/ui";
import { CustomerPhoneVerified } from "../CustomersPhoneVerified";
import { DataTableProps } from "./CustomersTable.type";

export const CustomersTable = ({}: DataTableProps) => {
  return (
    <div className="overflow-x-auto">
      <UI.Table>
        <UI.TableHeader>
          <UI.TableRow>
            <UI.TableHead>
              <UI.Checkbox />
            </UI.TableHead>
            <UI.TableHead>S/N</UI.TableHead>
            <UI.TableHead>Balance</UI.TableHead>
            <UI.TableHead>User</UI.TableHead>
            <UI.TableHead>Verified</UI.TableHead>
            <UI.TableHead>Status</UI.TableHead>
            <UI.TableHead>Last Login</UI.TableHead>
            <UI.TableHead>Orders</UI.TableHead>
            <UI.TableHead>Action</UI.TableHead>
          </UI.TableRow>
        </UI.TableHeader>
        <UI.TableBody>
          {Array(10)
            .fill(0)
            .map((_, i) => {
              return (
                <UI.TableRow key={i}>
                  <UI.TableCell>
                    <UI.Checkbox />
                  </UI.TableCell>
                  <UI.TableCell>1.</UI.TableCell>
                  <UI.TableCell>#43,650.02</UI.TableCell>
                  <UI.TableCell>
                    <UI.TableUser />
                  </UI.TableCell>
                  <UI.TableCell>
                    <CustomerPhoneVerified />
                  </UI.TableCell>
                  <UI.TableCell>
                    <UI.TableStatus />
                  </UI.TableCell>
                  <UI.TableCell>
                    <p>9:42pm</p>
                    <p className="mt-1">12/04/23</p>
                  </UI.TableCell>
                  <UI.TableCell>
                    <p>345 completed</p>
                  </UI.TableCell>
                  <UI.TableCell>
                    <UI.Switch />
                  </UI.TableCell>
                </UI.TableRow>
              );
            })}
        </UI.TableBody>
      </UI.Table>
    </div>
  );
};
